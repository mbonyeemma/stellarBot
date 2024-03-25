import Execution from './Execution.js';
import { config } from './config.js';
import tradeHelper from './helpers/trade.model.js'
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



    const hasSellOffers = await execution.hasSellOffers(assetToBuy)
    if (hasSellOffers) {
      console.log("Asset Has sell offers already")
      return;
    }

    const bAssetBalance = await execution.getAssetBalance(assetToBuy.code);
    if (bAssetBalance > 10) {
      console.log("Asset is already on the account", bAssetBalance)
      return true;
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

    if (!(await this.hasTrustLine(account, assetToBuy))) {
      console.log(`Adding trustline for asset: ${assetToBuy.code}`);
      await this.addTrustLine(assetToBuy, "100000000");
    }

    const result = await execution.placeBuyOrder(assetToBuy, amount, assetPrice);
    console.log('Buy order result:', result);
    if (result !== false) {
      tradeHelper.saveOrderDetails("buy", result, "XLM", assetToBuy.code, assetPrice, amount, 0);
      console.log("Offer saved to redis", { result, assetToBuy, assetPrice })
      this.sellAssetForProfit(assetToBuy);
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
      console.log("asset removal", assetToSell)


      if (assetToSell.code != nsAsset && assetToSell.issuer != issuerAddress) {
        console.log("RM 1 ")
        const isDeleted = await execution.deleteAllSellOffersForAsset(assetToSell)
        const assetBalance = await execution.getAssetBalance(assetToSell);
        const sellPrice = "0.0000001"
        let sellResult = false;
        console.log("RM 2 ", assetBalance)

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
      const openSellOrders = await execution.getOpenOrders(publicKey);
      console.log(`Open orders List`, openSellOrders)
      const relevantOrder = openSellOrders.find(order => order.sellingAsset === sellingAssetDetails);

      if (!relevantOrder) {
        // If no relevant selling order, consider creating a new sell order based on market conditions
        const orderbook = await server.orderbook(asset, new StellarSdk.Asset('XLM')).call();
        const assetBalance = await execution.getAssetBalance(asset);
        const sellPrice = await this.calculateSellPrice(orderbook, assetBalance);
        console.log("sellPrice", sellPrice)
        console.log("assetBalance", assetBalance)

        if (assetBalance > 1) {
          console.log("Place order Level 1", sellingAssetCode)

          //  await tradeHelper.saveOrderDetails("buy", "0x00000", "XLM", sellingAssetCode, sellPrice, assetBalance, sellPrice, 'completed');
          console.log(`Place sell order 1`, { asset, assetBalance, sellPrice })
          const sellResult = await execution.placeSellOrder(asset, assetBalance, sellPrice);
          console.log(`Place sell order response`, sellResult);
          if (sellResult !== false) {
            await tradeHelper.saveOrderDetails("sell", sellResult, sellingAssetCode, "XLM", sellPrice, assetBalance, 0);
          }
        }
      } else {
        console.log(`Existing order found for ${relevantOrder}, monitoring...`);

        const offerId = relevantOrder.offerId
        const offer = await execution.getOfferById(offerId);
        if (offer == null || offer == undefined) {
          console.log(`Offer ${offerId} not found in DB, deleting it.`);
          tradeHelper.updateOrderStatus(offerId, 'closed');
          return;
        }
        await this.monitorAndAdjustSellOrders(offerId);

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
      let selling_amount = 0
      let price_track = 0
      const profit_loss_percentage = 0.03;



      // Retrieve existing order details
      const offer = await execution.getOfferById(offerId);
      if (offer == null || offer == undefined) { // Order not available in DB, delete it
        console.log(`Offer ${offerId} not found in DB, deleting it.`);
        return;
      }


      const sellingAssetDetails = offer.sellingAsset;
      const buyingAssetDetails = offer.buyingAsset;

      // Split asset details into code and issuer
      const [sellingAssetCode, sellingAssetIssuer] = sellingAssetDetails.includes(':') ? sellingAssetDetails.split(':') : ['XLM', ''];
      const [buyingAssetCode, buyingAssetIssuer] = buyingAssetDetails.includes(':') ? buyingAssetDetails.split(':') : ['XLM', ''];
      const offerAmount = offer.amount

      const assetBalance = await execution.getAssetBalance({ code: sellingAssetCode, issuer: sellingAssetIssuer });
      if (!assetBalance) {
        console.error("Failed to retrieve asset balance.");
        return;
      }

      const sellingAsset = new StellarSdk.Asset(sellingAssetCode, sellingAssetIssuer)
      const amountAfterSell = await execution.calculateSellAmount(sellingAsset, assetBalance);
      const currentPrice = amountAfterSell / assetBalance;

      const existingDetails = await tradeHelper.retrieveOrderDetails(sellingAssetCode);

      if (existingDetails != null) {
        price_track = existingDetails['price_track']
        selling_amount = existingDetails['selling_amount']
      } else {
        tradeHelper.saveOrderDetails("buy", offerId, "XLM", sellingAssetCode, currentPrice, amountAfterSell, 0);
        price_track = currentPrice
        selling_amount = assetBalance
      }


      const possibleMargin = amountAfterSell - selling_amount
      const amountChange = (possibleMargin / selling_amount) * 100


      const priceChange = (currentPrice / price_track) * 100

      console.log("profitMarginPercentage", amountChange, priceChange)
      await tradeHelper.updateOrderPrice(offerId, currentPrice)

      if (priceChange < 0) {
        if (priceChange < (-1 * profit_loss_percentage)) {
          //loss tolerance reached, need to exit now
          //cancel the order and remove this asset ASAP
          await this.removeAsset(sellingAsset);
          // await execution.deleteOffer(offerId);
          tradeHelper.updateOrderStatus(offerId, "closed", marginPercentage)
        }
      } else {
        if (priceChange > 0.1) {
          //now in a profit, you can exit now or maintain another profit margin
          //for now, we can trail the upward trend and see how far it goes
          //cance the order and exit this market
          // await execution.deleteOffer(offerId);
          await this.removeAsset(sellingAsset);
          tradeHelper.updateOrderStatus(offerId, "closed", marginPercentage)
        }

      }


      // Assuming calculateSellPrice is a method that calculates the sell price based on some logic
      const sellPrice = this.calculateSellPrice(orderbook, assetBalance, offer.buyPrice);
      const assetPrice = parseFloat(orderbook.bids[0].price);

      const margin = sellPrice - bought_at
      // if the margin is tending to negative, u are making a loss, u need to exit ASAP
      if (margin) {

      }

      const sellAmount = (0.5 * assetBalance).toFixed(6);

      const currentProfit = (assetPrice - offer.buyPrice) / offer.buyPrice;

      /*
      // Update sell order - Assuming this method exists and is correctly implemented
      const sellResult = await execution.placeSellOrder({
        assetToSell: { code: sellingAssetCode, issuer: sellingAssetIssuer },
        amount: sellAmount,
        price: sellPrice
      });
      */

      const sellResult = await execution.updateOffer(offerId, assetToSell, assetToSell, sellAmount, sellPrice);

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
