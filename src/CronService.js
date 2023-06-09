import cron from 'node-cron';
import AssetLookup from './AssetLookup.js';
import { redis } from './config';
import redisClient from './redisClient';
import * as helper from './Helper.js'
import Trader from './Trader.js'
import StellarSdk from 'stellar-sdk';
import Execution from './Execution.js';
import fetch from 'node-fetch';
import { Asset, Server } from 'stellar-sdk';

const serverUrl = 'https://horizon.stellar.org';
const publicKey = 'GANDGDF7ZHF7RVXMI53PUSCMVWEFANGTZ4RLEH2DGPDFI5BGWYOLAXRR';
const url = `${serverUrl}/assets?asset_issuer=${publicKey}&limit=200`;
const execution = new Execution();
const trader = new Trader();
let isInit = true;

export default class CronService {
  constructor() {
    this.assets = new AssetLookup();
    //this.init();
    this.placeInitialOrder();
    //this.offersCron();
    this.sellAssets();
    this.checkCoinLoop();
  }


  // EVERY MINUTE
  async placeInitialOrder() {
    console.log("BUYING Assets every MINUTE")
    cron.schedule('*/5 * * * *', this.buyAssets, {
      scheduled: true
    });
  }

  // EVERY 2 MINUTES
  async sellAssets() {
    console.log("sellAssets every 2 minutes...");
    cron.schedule('*/2 * * * *', this.sellAssetOnMarket, {
      scheduled: true
    });
  }

  // EVERY 1 HOUR
  async checkCoinLoop() {
    console.log("Checking the coins every hour");
    // THIS IS TO CHECK THE ISSUER ACCOUNT AND SEND EMMA AN SMS
    cron.schedule('*/30 * * * *', this.trackClicCoins, {
      scheduled: true
    });
  }


    // EVERY 30 SECONDS. NOT USED FOR NOW
    async offersCron() {
      console.log("offersWorker, every 30 secods");
      cron.schedule('*/30 * * * * *', this.offersWorker, {
        scheduled: true
      });
    }
    

  async buyAssets() {
    let bestAssetsJSON = await redisClient.get(redis.bestAssetsKey);
    if (bestAssetsJSON) {
      const bestAssets = JSON.parse(bestAssetsJSON);
      bestAssets.forEach(async element => {
        const asset = element
        console.log("bestAsset", asset);
        const assetObj = new StellarSdk.Asset(asset.code, asset.issuer);
        await trader.init(assetObj);
       // await this.sleep(2)
      });
    }
  }


  async init() {
    try {
      await redisClient.del(redis.bestAssetsKey);
      isInit = false
      console.log("Starting cron service to update best assets...");
      const bestAssetsJSON = await redisClient.get(redis.bestAssetsKey);
      console.log("bestAssetsJSON", bestAssetsJSON);
      if (!bestAssetsJSON || bestAssetsJSON.length < 3) {
        console.log("Best assets data not found in Redis. Updating immediately...");
        await this.updateBestAssets();
      }

      // EVERY DAY
      cron.schedule('0 0 * * *', this.updateBestAssets, {
        scheduled: true
      });
    } catch (error) {
      console.log("REDIS ERROR", error)
      if (isInit) {
        console.log("sleeping for 10 sec and try AGAIN")
        await this.sleep(10000000)
        this.init();
      }
    }
  }



  async removeAssets() {
    const balances = await execution.getBalances();
    console.log("removeAssets ")
    const AssetsToRemove = []
    for (let i = 0; i < balances.length; i++) {
      const balance = balances[i];
      const asset_type = balance.asset_type
      if (asset_type != 'native') {
        const asset = balance.asset_code
        const issuer = balance.asset_issuer
        const sellAsset = execution.createAsset(asset, issuer)
        const assetBalance = parseFloat(balance.balance);

        if (assetBalance < 5) {
          console.log("removing asset,  ", sellAsset)
          await trader.removeAsset(sellAsset);
          console.log("asset remoed , sleeping for 2 sec  ")
        }
      }
    }
    return true;
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  async sellAssetOnMarket() {
    const balances = await execution.getBalances();
    console.log("BALANCES ", balances)

    for (let i = 0; i < balances.length; i++) {
      const balance = balances[i];
      const asset_type = balance.asset_type
      if (asset_type != 'native') {
        const asset = balance.asset_code
        const issuer = balance.asset_issuer
        const sellAsset = execution.createAsset(asset, issuer)
        const assetBalance = parseFloat(balance.balance);

        if (assetBalance > 0 ) {
          console.log("selling ", sellAsset)
          await trader.sellAssetOnMarket(sellAsset);
        }
      }
    }
  }


  async offersWorker() {

    const orders = await helper.getAllRunningOrders();
    console.log("Orders", orders)
    if (orders !== undefined) {
      orders.forEach(async order_id => {
        const orderInfo = await helper.retrieveOrderDetails(order_id)
        if (orderInfo != undefined) {
          await trader.monitorBuyOrderAndPlaceSellOrder(orderInfo.asset, orderInfo.order_id, orderInfo.price);
        }
      });
    }
  }



  async updateBestAssets() {
    try {
      this.removeAssets();
      const bestAssets = await this.assets.getBestAssetsToTrade(5);
      console.log("GOT THE BEST ASSETS", bestAssets);
      await redisClient.set(redis.bestAssetsKey, JSON.stringify(bestAssets));
      await redisClient.set(redis.lastUpdatedKey, Date.now());
    } catch (error) {
      console.log("updateAssetsError", error)
    }

  }



  async calculateXlmFromAsset(sourceAsset, amount) {
    try {
      // Construct the API endpoint URL
      const url = `https://horizon.stellar.org/paths/strict-send?destination_assets=native&source_asset_type=credit_alphanum4&source_asset_issuer=${sourceAsset.issuer}&source_asset_code=${sourceAsset.code}&source_amount=${amount}`;
      // Fetch the response from the API
      const response = await fetch(url);
      const json = await response.json();

      // Extract the estimated XLM amount from the response
      const estimatedXlmAmount = parseFloat(json._embedded.records[0].destination_amount);
      console.log("estimatedXlmAmount", estimatedXlmAmount)

      return estimatedXlmAmount;
    } catch (err) {
      return 0;
    }
  }

  async getXlmEquivalent() {
    // Get the list of assets issued by the account
    const response = await fetch(url);
    const assets = await response.json();

    const xlmEquivalent = {};
    // Loop through the assets and calculate the XLM equivalent of 10,000 units of each asset
    for (const asset of assets._embedded.records) {
      console.log('Asset code:', asset.asset_code);
      console.log('Asset issuer:', asset.asset_issuer);

      const assetToSell = new Asset(asset.asset_code, asset.asset_issuer);
      const xlmAmount = await this.calculateXlmFromAsset(assetToSell, '10000');
      xlmEquivalent[asset.asset_code] = xlmAmount;
    }

    const assetToSell = new Asset("CLIX", "GBCJSKXTZX5CYKJGBGQPYEATLSGR4EPRUOL7EKIDCDOZ4UC67BBQRCSO");
    const xlmAmount = await calculateXlmFromAsset(assetToSell, '10000');
    xlmEquivalent["CLIX"] = xlmAmount;

    return xlmEquivalent;
  }


  async sendSMS(message) {
    try {
      const phone = "256787719618"
      const url = 'https://clic.world/fedapi/v2/sms.php';
      const formData = new URLSearchParams({
        phone: phone,
        message: message,
      });

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      const result = await response.text();
      console.log(result); // the response from the server
      return true
    } catch (error) {
      return false;
    }
  }


  trackClicCoins() {
    getXlmEquivalent().then((result) => {
      console.log(result);

      for (const asset in result) {
        const amount = result[asset]
        if (amount > 499 || (asset == "CLIX" && amount > 200)) {
          const message = `Cli Asset Alert. Asset code: ${asset}, Amount: ${result[asset]}`
          sendSMS(message)
        }
      }
    }).catch((error) => {
      console.error(error);
    });
  }



}

