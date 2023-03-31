import Execution from './Execution.js';
import { config } from './config.js';
import * as helper from './Helper.js'
import StellarSdk, { Keypair, Asset } from 'stellar-sdk';
var server = new StellarSdk.Server("https://horizon.stellar.org");

const execution = new Execution();
export default class Trader {

  async init(assetToBuy) {
    console.log("step1")
    const publicKey = config.publicKey;
    const secretKey = config.secretKey;
    const keypair = Keypair.fromSecret(secretKey);

    const account = await server.loadAccount(publicKey);
    if (!(await this.hasTrustLine(account, assetToBuy))) {
      console.log(`Adding trustline for asset: ${assetToBuy.code}`);
      await this.addTrustLine(server, account, assetToBuy, keypair);
    }

    const assetPrice = await execution.getAssetPrice(assetToBuy);
    const quoteAssetBalance = await execution.getAssetBalance(config.quoteAsset);

    console.log(`Asset to buy: ${assetToBuy.code}, Asset price: ${assetPrice}, Quote asset balance: ${quoteAssetBalance}`);
    console.log("step ", 2)

    const amount = ((quoteAssetBalance * 0.4) / assetPrice).toFixed(7)
    console.log("amount", amount)

    const result = await execution.placeBuyOrder(assetToBuy, amount, assetPrice);
    console.log('Buy order result:', result);

    if (result !== false) {
      const isDeleted = await execution.deleteAllSellOffersForAsset(assetToBuy)
      if (isDeleted) {
        helper.addOrderId(result)
        helper.saveOrderDetails(result, assetToBuy.code, assetPrice, amount, 0);
      }
      console.log("Offer saved to redis", { result, assetToBuy, assetPrice })
    }
  }




  async hasTrustLine(account, asset) {
    return account.balances.some(
      (balance) =>
        balance.asset_code === asset.code &&
        balance.asset_issuer === asset.issuer
    );
  }

  async addTrustLine(server, account, asset, keypair) {
    const assetObj = new StellarSdk.Asset(asset.code, asset.issuer);
    const trustlineOperation = StellarSdk.Operation.changeTrust({
      asset: assetObj,
      limit: '100000000', // Set a limit for the trust line
    });

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    })
      .addOperation(trustlineOperation)
      .setTimeout(180)
      .build();

    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);
    return result;
  }


  async sellAssetOnMarket(assetToSell) {
    try {
      const isDeleted = await execution.deleteAllSellOffersForAsset(assetToSell)
      const baseAsset = execution.createAsset("XLM", "")

      const orderbook = await server.orderbook(assetToSell,baseAsset).call();

      const assetBalance = await execution.getAssetBalance(assetToSell);
      const sellPrice = await this.calculateSellPrice(orderbook, assetBalance, null, null);
      console.log("sellPrice", sellPrice)
      const sellAmount = assetBalance;

      const sellResult = await execution.placeSellOrder(assetToSell, sellAmount, sellPrice, 0);
      console.log(`Sell order placed at ${sellPrice}.`, sellResult);
    } catch (err) {
      console.log("ERRO 2", err)

    }

    return true;
  }


  async monitorBuyOrderAndPlaceSellOrder(assetToBuy, buyOrderId, buyPrice) {
    try {
      const existingDetails = await helper.retrieveOrderDetails(buyOrderId);
      let minimumExitProfit = existingDetails.lastHightProfit;


      const increment = (currentProfit) => {
        return Math.floor((currentProfit - 0.01) * 100) / 100;
      };

      const updateMinimumExitProfit = async (currentProfit) => {
        if (currentProfit >= minimumExitProfit) {
          await helper.updateLastHighProfit(buyOrderId, currentProfit);
          return currentProfit;
        }
        return minimumExitProfit;
      };

      let assetPrice;
      const isDeleted = await execution.deleteAllSellOffersForAsset(assetToBuy)


      const orderbook = await server.orderbook(config.quoteAsset, assetToBuy).call();

      const AssetBalance = await execution.getAssetBalance(assetToBuy);
      const sellPrice = this.calculateSellPrice(orderbook, AssetBalance, buyPrice)
      assetPrice = parseFloat(orderbook.bids[0].price);
      const sellAmount = (0.5 * AssetBalance).toFixed(6)

      const currentProfit = (assetPrice - buyPrice) / buyPrice;


      const sellResult = await execution.placeSellOrder(assetToBuy, sellAmount, sellPrice, 0);
      sellOfferId = sellResult;
      console.log(`Sell order placed at ${sellPrice}. Profit: ${minimumExitProfit * 100}%`, sellResult);

      minimumExitProfit = updateMinimumExitProfit(currentProfit);

      return minimumExitProfit;
    } catch (error) {
      console.log("MONITOR ERROR", error)
    }
  }

  async calculateSellPrice(orderbook, amount, Price) {
    let accumulatedAmount = 0;
    let topBuyPrice = Price;
    let topBuyAmount = amount;
    console.log("amount",amount)

    console.log("BIDS",orderbook.asks)
  
    for (let i = 0; i < orderbook.asks.length; i++) {
      const buy = orderbook.asks[i];
      accumulatedAmount += parseFloat(buy.amount);
  
      console.log("accumulatedAmount",accumulatedAmount)


      if (accumulatedAmount >= amount * 0.3) {
        topBuyPrice = parseFloat(buy.price);
        topBuyAmount = accumulatedAmount;
        break;
      }
    }
  
    if (!topBuyPrice || !topBuyAmount) {
      return 0.1;
    }
  
    // Find the highest ask price where the amount is more than 30% of the total asks
    let askPrice = 0;
    for (let i = 0; i < orderbook.asks.length; i++) {
      const ask = orderbook.asks[i];
      if (parseFloat(ask.amount) >= topBuyAmount) {
        askPrice = parseFloat(ask.price);
        break;
      }
    }
  
    // If the ask price is 0, use the second lowest ask price
    if (askPrice === 0 && orderbook.asks.length >= 2) {
      askPrice = parseFloat(orderbook.asks[1].price);
    }
  
    const option2Price = askPrice * 1.03;
    console.log("option1Price", topBuyPrice, "option2Price", option2Price)
    const sellPrice = Math.min(topBuyPrice, option2Price);
  
    return (sellPrice - 0.0000002)
  }
  


}
