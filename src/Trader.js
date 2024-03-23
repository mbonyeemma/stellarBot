import Execution from './Execution.js';
import { config } from './config.js';
import  tradeHelper from './helpers/trade.model.js'
import StellarSdk, { Keypair, Asset } from 'stellar-sdk';
import dotenv from 'dotenv'
dotenv.config()

var server = new StellarSdk.Server("https://horizon.stellar.org");

const execution = new Execution();
export default class Trader {

  async BuyAssets(assetToBuy) {
    console.log("started the init function with asset,", assetToBuy)
    const publicKey = config.publicKey;
    const secretKey = config.secretKey;
    const account = await server.loadAccount(publicKey);

    if (!(await this.hasTrustLine(account, assetToBuy))) {
      console.log(`Adding trustline for asset: ${assetToBuy.code}`);
      await this.addTrustLine(assetToBuy, "100000000");
    } else {
      const bAssetBalance = await execution.getAssetBalance(assetToBuy.code);
      if (bAssetBalance > 0) {
        console.log("Asset is already on the account", bAssetBalance)
        return true;
      }
    }

    const assetPrice = await execution.getAssetPrice(assetToBuy);
    const quoteAssetBalance = await execution.getAssetBalance(config.quoteAsset);

    console.log(`Asset to buy: ${assetToBuy.code}, Asset price: ${assetPrice}, Quote asset balance: ${quoteAssetBalance}`);
    console.log("step ", 2)

    if (quoteAssetBalance < 20) {
      console.log("not enough funds to trade", quoteAssetBalance)
      return true;
    }

    const amount = ((quoteAssetBalance * 0.4) / assetPrice).toFixed(7)
    console.log("amount", amount)

    const result = await execution.placeBuyOrder(assetToBuy, amount, assetPrice);
    console.log('Buy order result:', result);

    if (result !== false) {
      tradeHelper.insertAsset(assetToBuy.code, assetToBuy.issuer)

      const isDeleted = await execution.deleteAllSellOffersForAsset(assetToBuy)
      if (isDeleted) {
        // tradeHelper.addOrderId(result)
        tradeHelper.saveOrderDetails("buy", result, "XLM", assetToBuy.code, assetPrice, amount, 0);
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

  async addTrustLine(asset, limit) {
    try {
      const publicKey = config.publicKey;
      const secretKey = config.secretKey;
      const account = await server.loadAccount(publicKey);

      const keypair = Keypair.fromSecret(secretKey);

      const assetObj = new StellarSdk.Asset(asset.code, asset.issuer);
      const trustlineOperation = StellarSdk.Operation.changeTrust({
        asset: assetObj,
        limit: limit, // Set a limit for the trust line
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
    } catch (error) {
      return false
    }
  }



  async removeAsset(assetToSell) {
    try {
      // return true;
      const issuerAddress = process.env.wIssuer
      const nsAsset = process.env.wAsset
      console.log("asset removal",assetToSell)


      if (assetToSell.code != nsAsset && assetToSell.issuer != issuerAddress) {
        console.log("RM 1 ")
        const isDeleted = await execution.deleteAllSellOffersForAsset(assetToSell)
        const assetBalance = await execution.getAssetBalance(assetToSell);
        const sellPrice = "0.0000001"
        let sellResult = false;
        console.log("RM 2 ",assetBalance)

        if (assetBalance > 1) {
          sellResult = await execution.StrictSendTransaction(assetToSell, assetBalance);
          console.log(`Strictr send placed at ${sellPrice}.`, sellResult);
          if (sellResult !== false) {
            sellResult = true
          } else {
            sellResult = await execution.placeSellOrder(assetToSell, assetBalance, sellPrice, 0);
            console.log(`Sell order placed at ${sellPrice}.`, sellResult);
          }

          if (sellResult == false) {
            sellResult = await execution.placeSellOrder(assetToSell, assetBalance, sellPrice, 0);
          }
        }

        const assetNewBalance = await execution.getAssetBalance(assetToSell);

        if (assetNewBalance == 0) {
          await this.addTrustLine(assetToSell, "0");
          console.log('Asset Removed', assetToSell);
          

        }
      }

    } catch (err) {
      console.log("ERROR REMOVING ASSET", err)
    }
    return true;
  }

  async sellAssetOnMarket(assetToSell, command) {
    try {
      const isDeleted = await execution.deleteAllSellOffersForAsset(assetToSell)
      const baseAsset = execution.createAsset("XLM", "")

      const orderbook = await server.orderbook(assetToSell, baseAsset).call();

      const assetBalance = await execution.getAssetBalance(assetToSell);
      let sellPrice = await this.calculateSellPrice(orderbook, assetBalance, null, null);

      if (command == "liquidate") {
        sellPrice = "0.0000001"
      }
      console.log("sellPrice", sellPrice)
      const sellAmount = assetBalance;
      sellPrice = sellPrice.toFixed(7)
      if (sellPrice > 0) {
        const sellResult = await execution.placeSellOrder(assetToSell, sellAmount, sellPrice, 0);
        console.log(`Sell order placed at ${sellPrice}.`, sellResult);
      } else {
        console.log(`Sell order NOT placed at ${sellPrice}.`);
      }


    } catch (err) {
      console.log("ERRO 2", err)

    }

    return true;
  }


  async initialAssetSell() {
    try {
      const publicKey = config.publicKey;
      console.log("Initiating balance check for account", publicKey)
      const balances = await execution.getBalances(publicKey);
     // console.log('Balances for account', balances)
      for (const balance of balances) {
        if (balance.asset_type !== 'native' && parseFloat(balance.balance) > 0) {
          const assetDetails = balance.asset_type === 'credit_alphanum4' || balance.asset_type === 'credit_alphanum12' ?
            `${balance.asset_code}:${balance.asset_issuer}` : 'XLM';
          await this.sellAssetForProfit(assetDetails);
        }
      }

      
      /*
      const openOrders = await tradeHelper.getBuyOffers();
      console.log("tracking buy orders", openOrders)
      for (const order of openOrders) {
        const offerId = order.offerId
        const offer = await execution.getOfferById(offerId);
        if (offer == null || offer == undefined) { // Order not available in DB, delete it
          console.log(`Offer ${offerId} not found in DB, deleting it.`);
          tradeHelper.updateOrderStatus(offerId, 'closed');
          return;
        }
        await this.monitorAndAdjustSellOrders(offerId);
      }
      */

      

    } catch (error) {
      console.error("Error in monitorOrders:", error);
    }
  }



  async sellAssetForProfit(sellingAssetDetails) {
    try {

      console.log("SELL===>", sellingAssetDetails)
      const [sellingAssetCode, sellingAssetIssuer] = sellingAssetDetails.split(':');
      const asset = new StellarSdk.Asset(sellingAssetCode, sellingAssetIssuer === 'XLM' ? undefined : sellingAssetIssuer);

      const publicKey = config.publicKey;
      console.log(`Fetching open orders for key ${publicKey}`)
      const openOrders = await execution.getOpenOrders(publicKey);
      console.log(`Open orders List`,openOrders)
      const relevantOrder = openOrders.find(order => order.sellingAsset === sellingAssetDetails);

      if (!relevantOrder) {
        // If no relevant selling order, consider creating a new sell order based on market conditions
        const orderbook = await server.orderbook(asset, new StellarSdk.Asset('XLM')).call();
        const assetBalance = await execution.getAssetBalance(asset);
        const sellPrice = await this.calculateSellPrice(orderbook, assetBalance);
        console.log("sellPrice",sellPrice)
        console.log("assetBalance",assetBalance)

        if (assetBalance > 1) {
          console.log("Place order Level 1",sellingAssetCode)

        //  await tradeHelper.saveOrderDetails("buy", "0x00000", "XLM", sellingAssetCode, sellPrice, assetBalance, sellPrice, 'completed');
         console.log(`Place sell order 1`,{asset, assetBalance, sellPrice})
          const sellResult = await execution.placeSellOrder(asset, assetBalance, sellPrice);
          console.log(`Place sell order response`,sellResult);
          if(sellResult !==false){
            await tradeHelper.saveOrderDetails("sell", sellResult, sellingAssetCode, "XLM", sellPrice, assetBalance, 0);
          }
        }
      } else {
        console.log(`Existing order found for ${sellingAssetDetails}, monitoring...`);
        // Here you might monitor the order or adjust it based on new market conditions
      }
    } catch (error) {
      console.error("Error in sellAssetForProfit:", error);
      return false
    }
    return true;
  }




  async monitorAndAdjustSellOrders(offerId) {
    try {


      // Retrieve existing order details
      const offer = await execution.getOfferById(offerId);
      if (offer == null || offer == undefined) { // Order not available in DB, delete it
        console.log(`Offer ${offerId} not found in DB, deleting it.`);
        //await execution.deleteOffer(offerId);
        return;
      }


      const sellingAssetDetails = offer.sellingAsset; // Assuming "CODE:ISSUER"
      const buyingAssetDetails = offer.buyingAsset; // Assuming "CODE:ISSUER"

      // Split asset details into code and issuer
      const [sellingAssetCode, sellingAssetIssuer] = sellingAssetDetails.includes(':') ? sellingAssetDetails.split(':') : ['XLM', ''];
      const [buyingAssetCode, buyingAssetIssuer] = buyingAssetDetails.includes(':') ? buyingAssetDetails.split(':') : ['XLM', ''];


      let minimumExitProfit = existingDetails.lastHighProfit;

      const orderbook = await server.orderbook(
        new StellarSdk.Asset(buyingAssetCode, buyingAssetIssuer),
        new StellarSdk.Asset(sellingAssetCode, sellingAssetIssuer)
      ).call();

      const assetBalance = await execution.getAssetBalance({ code: sellingAssetCode, issuer: sellingAssetIssuer });
      if (!assetBalance) {
        console.error("Failed to retrieve asset balance.");
        return;
      }

      // Assuming calculateSellPrice is a method that calculates the sell price based on some logic
      const sellPrice = this.calculateSellPrice(orderbook, assetBalance, offer.buyPrice);
      const assetPrice = parseFloat(orderbook.bids[0].price);
      const sellAmount = (0.5 * assetBalance).toFixed(6);

      const currentProfit = (assetPrice - offer.buyPrice) / offer.buyPrice;

      // Update sell order - Assuming this method exists and is correctly implemented
      const sellResult = await execution.placeSellOrder({
        assetToSell: { code: sellingAssetCode, issuer: sellingAssetIssuer },
        amount: sellAmount,
        price: sellPrice
      });

      tradeHelper.updateOrder("sell", sellResult, sellingAssetCode, "XLM", sellPrice, assetBalance, 0);


      console.log(`Sell order placed at ${sellPrice}. Profit: ${currentProfit * 100}%`, sellResult);

      // Assuming updateMinimumExitProfit correctly updates and returns the new minimum exit profit
      minimumExitProfit = await this.updateMinimumExitProfit(currentProfit, offerId);

      return minimumExitProfit;
    } catch (error) {
      console.log("MONITOR ERROR", error);
    }
  }

  updateMinimumExitProfit = async (currentProfit, orderId) => {
    // Retrieve the current details of the order to get the last high profit.
    const existingDetails = await tradeHelper.retrieveOrderDetails(orderId);

    // Check if currentProfit is greater than the last stored high profit and update if so.
    if (currentProfit > existingDetails.lastHighProfit) {
      await tradeHelper.updateLastHighProfit(orderId, currentProfit);
      return currentProfit; // New minimum exit profit is the current profit.
    }

    return existingDetails.lastHighProfit; // No update needed, return the stored value.
  };


  async calculateSellPrice(orderbook, amount = null, price = null) {
    let accumulatedAmount = 0;
    // If price is not provided, use the first ask price as a fallback or a default value if no asks are present.
    let topBuyPrice = price || (orderbook.asks.length > 0 ? parseFloat(orderbook.asks[0].price) : 0.1);
    let targetAmount = amount || (orderbook.asks.reduce((acc, ask) => acc + parseFloat(ask.amount), 0) * 0.3); // 30% of total asks volume if amount not provided

    for (let i = 0; i < orderbook.asks.length; i++) {
      const ask = orderbook.asks[i];
      accumulatedAmount += parseFloat(ask.amount);

      console.log("accumulatedAmount", accumulatedAmount);

      if (accumulatedAmount >= targetAmount) {
        topBuyPrice = parseFloat(ask.price); // Update topBuyPrice based on the current ask
        break;
      }
    }

    // Calculate the option2Price based on the highest ask price encountered or fallback to default if none are suitable
    let askPrice = orderbook.asks.length > 0 ? parseFloat(orderbook.asks[0].price) * 1.03 : topBuyPrice; // A little above the first ask price or topBuyPrice

    // Use the minimum of topBuyPrice and askPrice as the sell price, adjusted slightly downwards to make it competitive
    const sellPrice = Math.min(topBuyPrice, askPrice) - 0.0000002;

    return sellPrice;
  }



}
