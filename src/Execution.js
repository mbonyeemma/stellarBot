import StellarSdk,{Asset} from 'stellar-sdk';
import { config } from './config';
import dotenv from 'dotenv'
dotenv.config()

const server = new StellarSdk.Server(config.horizonServer);
const sourceKeys = StellarSdk.Keypair.fromSecret(config.secretKey);

export default class Execution {
  async placeBuyOrder(assetToBuy, amount, price, offerId = 0) {
    return this.manageBuyOffer(assetToBuy, amount, price, offerId);
  }

  async updateBuyOrder(assetToBuy, amount, price, offerId) {
    return this.manageBuyOffer(assetToBuy, amount, price, offerId);
  }

  async deleteBuyOrder(offerId) {
    return this.manageBuyOffer(null, 0, 1, offerId);
  }

  async deleteAllSellOffersForAsset(asset) {
    try {
      const keypair = StellarSdk.Keypair.fromSecret(config.secretKey);
      const publicKey = keypair.publicKey();
      const account = await server.loadAccount(publicKey);
      const offers = await server.offers().forAccount(publicKey).call();

      const sellOffersToDelete = offers.records.filter(
        (offer) =>
          offer.selling.asset_code === asset.code &&
          offer.selling.asset_issuer === asset.issuer
      );

      if (sellOffersToDelete.length === 0) {
        console.log("No sell offers found for the asset.");
        return true;
      }

      const [
        {
          max_fee: { mode: fee },
        },
      ] = await Promise.all([server.feeStats()]);

      const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
        fee,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      });

      sellOffersToDelete.forEach((offer) => {

        const buyAssetType = offer.buying.asset_type
        let buyAsset;
        if (buyAssetType == 'native') {
          buyAsset = StellarSdk.Asset.native();
        } else {
          buyAsset = new StellarSdk.Asset(offer.buying.asset_code, offer.buying.asset_issuer)
        }

        console.log("offerObject", offer)
        const offerObject = {
          selling: asset,
          buying: buyAsset,
          amount: "0",
          price: offer.price,
          offerId: offer.id,
        }
        console.log("offerObject", offerObject)

        const manageSellOfferOp = StellarSdk.Operation.manageSellOffer(offerObject);

        transactionBuilder.addOperation(manageSellOfferOp);
      });

      const transaction = transactionBuilder.setTimeout(100).build();
      transaction.sign(keypair);

      const transactionResult = await server.submitTransaction(transaction);
      console.log(transactionResult);

      return true;
    } catch (error) {
      console.error("Error deleting sell offers for asset:", error);
      return false;
    }
  }

  async getBalances() {
    const publicKey = StellarSdk.Keypair.fromSecret(config.secretKey).publicKey();
    const account = await server.loadAccount(publicKey);
    return account.balances
  }

  async getAvailableAssetAmount(asset) {
    try {
      const publicKey = StellarSdk.Keypair.fromSecret(config.secretKey).publicKey();
      const account = await server.loadAccount(publicKey);
      const offers = await server.offers().forAccount(publicKey).call();

      let assetBalance = 0;
      let assetSellAmount = 0;

      // Find the asset balance
      account.balances.forEach((balance) => {
        if (
          balance.asset_code === asset.code &&
          balance.asset_issuer === asset.issuer
        ) {
          assetBalance = parseFloat(balance.balance);
        }
      });

      // Calculate the amount of the asset in active sell offers
      offers.records.forEach((offer) => {
        if (
          offer.selling.asset_code === asset.code &&
          offer.selling.asset_issuer === asset.issuer
        ) {
          assetSellAmount += parseFloat(offer.amount);
        }
      });

      // Calculate the amount of the asset not under a sell offer
      const availableAssetAmount = assetBalance - assetSellAmount;

      return availableAssetAmount;
    } catch (error) {
      console.error("Error getting available asset amount:", error);
      return false;
    }
  }


  async manageBuyOffer(assetToBuy, amount, price, offerId) {
    try {
      const senderKeypair = StellarSdk.Keypair.fromSecret(config.secretKey)

      let buyingAsset;
      if (assetToBuy) {
        buyingAsset = new StellarSdk.Asset(assetToBuy.code, assetToBuy.issuer);
      }

      const data = {
        selling: this.createAsset(config.quoteAsset),
        buying: buyingAsset,
        buyAmount: amount.toString(),
        price: price.toString(),
        offerId: offerId.toString(),
      }
      console.log(data)

      const [
        {
          max_fee: { mode: fee },
        },
        sender,
      ] = await Promise.all([
        server.feeStats(),
        server.loadAccount(senderKeypair.publicKey()),
      ]);

      const manageBuyOfferOp = StellarSdk.Operation.manageBuyOffer(data);

      var transaction = new StellarSdk.TransactionBuilder(sender, {
        fee,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      })
        .addOperation(manageBuyOfferOp)
        .setTimeout(100)
        .build();

      transaction.sign(senderKeypair);
      try {
        const transactionResult = await server.submitTransaction(transaction);
        return transactionResult.hash
      } catch (e) {
        console.error("Oh no! Something went wrong.");
        console.error(e);
        return false;
      }



    } catch (error) {
      console.error('Error managing buy offer:', error);
      return false;
    }
  }

  async placeSellOrder(assetToSell, amount, price, offerId = 0) {
    console.log("placeSellOrder", assetToSell, amount, price, offerId)
    try {
      const senderKeypair = StellarSdk.Keypair.fromSecret(config.secretKey);
      const sellingAsset = new StellarSdk.Asset(assetToSell.code, assetToSell.issuer);

      const data = {
        selling: sellingAsset,
        buying: this.createAsset(config.quoteAsset), // Your quote asset (e.g., USD)
        amount: amount.toString(),
        price: price.toString(),
        offerId: offerId.toString() // Set to 0 to create a new offer
      };
      console.log("sellArray", data);

      const [
        {
          max_fee: { mode: fee },
        },
        sender,
      ] = await Promise.all([
        server.feeStats(),
        server.loadAccount(senderKeypair.publicKey()),
      ]);

      const manageSellOfferOp = StellarSdk.Operation.manageSellOffer(data);
      var transaction = new StellarSdk.TransactionBuilder(sender, {
        fee,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      })
        .addOperation(manageSellOfferOp)
        .setTimeout(100)
        .build();

      transaction.sign(senderKeypair);
      try {
        const transactionResult = await server.submitTransaction(transaction);
        return transactionResult.hash
      } catch (e) {
        console.error("Oh no! Something went wrong.");
        console.error("Operations:", e.response.data.extras.result_codes.operations);
        return false;
      }
    } catch (error) {
      console.error("Error managing sell offer:", error);
      return false;
    }
  }
  async StrictSendTransaction(assetToSell, amount) {
    console.log("StrictSend", assetToSell, amount)
    try {
      const senderKeypair = StellarSdk.Keypair.fromSecret(config.secretKey);
      const sellingAsset = new StellarSdk.Asset(assetToSell.code, assetToSell.issuer);

      const data = {
        sendAsset: sellingAsset,
        sendAmount: amount.toFixed(7).toString(),
        destination: senderKeypair.publicKey(),
        destAsset: Asset.native(), 
        destMin: "0.0000001",
      };
      console.log("sellArray", data);

      const [
        {
          max_fee: { mode: fee },
        },
        sender,
      ] = await Promise.all([
        server.feeStats(),
        server.loadAccount(senderKeypair.publicKey()),
      ]);

      const manageSellOfferOp = StellarSdk.Operation.pathPaymentStrictSend(data);
      var transaction = new StellarSdk.TransactionBuilder(sender, {
        fee,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      })
        .addOperation(manageSellOfferOp)
        .setTimeout(100)
        .build();

      transaction.sign(senderKeypair);
      try {
        const transactionResult = await server.submitTransaction(transaction);
        return transactionResult.hash
      } catch (e) {
        console.error("Oh no! Something went wrong.");
        console.error("Operations:", e.response.data.extras.result_codes.operations);
        return false;
      }
    } catch (error) {
      console.error("Error managing sell offer:", error);
      return false;
    }
  }


  createAsset(assetCode, issuerPublicKey = '') {
    if (assetCode === 'XLM') {
      return StellarSdk.Asset.native();
    } else {
      return new StellarSdk.Asset(assetCode, issuerPublicKey);
    }
  }

  async getAssetPrice(assetToBuy) {
    try {
      const asset = new StellarSdk.Asset(assetToBuy.code, assetToBuy.issuer);
      const orderbook = await server.orderbook(asset, this.createAsset(config.quoteAsset)).call();
      if (orderbook.asks.length === 0) {
        throw new Error('No asks found in the order book.');
      }
      const price = parseFloat(orderbook.asks[0].price);
      return price;
    } catch (error) {
      console.error('Error fetching asset price:', error);
      return null;
    }
  }

  async getAssetBalance(asset) {
    try {
      const sourceAccount = await server.loadAccount(sourceKeys.publicKey());
      let balance;
      if (asset.code === 'XLM') {
        balance = parseFloat(sourceAccount.balances.find((balance) => balance.asset_type === 'native').balance);
      } else {
        const assetBalance = sourceAccount.balances.find(
          (balance) => balance.asset_code === asset.code && balance.asset_issuer === asset.issuer
        );
        if (!assetBalance) {
          throw new Error('Asset not found in the account.');
        }
        balance = parseFloat(assetBalance.balance);
      }
      return balance;
    } catch (error) {
      console.error('Error fetching asset balance:', error);
      return null;
    }
  }



}