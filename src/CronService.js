import fetch from 'node-fetch';
import cron from 'node-cron';
import StellarSdk, { Asset } from 'stellar-sdk';
import tradeHelper from './helpers/trade.model.js';
import { redis, config } from './config';
import redisClient from './redisClient';
import Execution from './Execution.js';
import Trader from './Trader.js';
import AssetLookup from './AssetLookup.js';

const SERVER_URL = 'https://horizon.stellar.org';
const PUBLIC_KEY = 'GANDGDF7ZHF7RVXMI53PUSCMVWEFANGTZ4RLEH2DGPDFI5BGWYOLAXRR';
const ASSETS_URL = `${SERVER_URL}/assets?asset_issuer=${PUBLIC_KEY}&limit=200`;

const server = new StellarSdk.Server(config.horizonServer);

export default class CronService {
  constructor() {
    this.execution = new Execution();
    this.assets = new AssetLookup(server);
    this.trader = new Trader();

    this.startBot();
  }

  startBot = async () => {
    try {
      await redisClient.del(redis.bestAssetsKey);
      console.log("Starting service to update best assets...");
      const bestAssetsJSON = await redisClient.get(redis.bestAssetsKey);

      // Run tasks every 30 seconds
      setInterval(async () => {
        const currentDate = new Date();
        const currentMinute = currentDate.getMinutes();
        const currentSecond = currentDate.getSeconds();
        console.log("currentMinute", currentMinute);

        const settings = await tradeHelper.getSettings();
        if (settings && settings.status === 'stop') {
          console.log("Bot is stopped");
          return;
        }

        if (settings && settings.status === 'liquidate') {
          console.log("Bot is in liquidation process");
          await this.sellAssetOnMarket("");
          return;
        }



        console.log("Updating assets")
        await this.updateBestAssets();

        console.log("Getting Buy Assets")
        await this.buyAssets();
        
        //selling assets on market
        await this.sellAssetOnMarket("");


      }, 60000);  // 30000 milliseconds = 30 seconds

    } catch (error) {
      console.error("REDIS ERROR", error);
    }
  }


  // You can remove the separate methods for placeInitialOrder and sellAssets since they are now consolidated into startBot






  buyAssets = async () => {
    const bestAssetsJSON = await redisClient.get(redis.bestAssetsKey);
    if (bestAssetsJSON) {
      const bestAssets = JSON.parse(bestAssetsJSON);
      for (const element of bestAssets) {
        const assetObj = new StellarSdk.Asset(element.code, element.issuer);
        await this.trader.init(assetObj);  // Assuming startBot is a method of trader
      }
    }
  }

  removeAssets = async () => {
    const balances = await this.execution.getBalances();
    for (const balance of balances) {
      if (balance.asset_type !== 'native') {
        const asset = balance.asset_code;
        const issuer = balance.asset_issuer;
        const assetBalance = parseFloat(balance.balance);

        console.log("asset", asset, issuer, assetBalance)
        const assetData = await tradeHelper.GetAsset(asset, issuer);
        tradeHelper.saveBalances(asset, issuer, "");

        if ((assetData && assetData.status === 'remove') || assetBalance < 5) {
          const sellAsset = this.execution.createAsset(asset, issuer);
          await this.trader.removeAsset(sellAsset);
          tradeHelper.saveBalances(asset, issuer, "remove");
        }
      }
    }

    return true;
  }

  sellAssetOnMarket = async (command) => {
    const balances = await this.execution.getBalances();
    for (const balance of balances) {
      if (balance.asset_type !== 'native' && parseFloat(balance.balance) > 0) {
        const sellAsset = this.execution.createAsset(balance.asset_code, balance.asset_issuer);
        await this.trader.sellAssetOnMarket(sellAsset, command);
      }
    }
  }

  // ... continuation ...

  offersWorker = async () => {
    const orders = await helper.getAllRunningOrders();
    if (orders) {
      for (const order_id of orders) {
        const orderInfo = await helper.retrieveOrderDetails(order_id);
        if (orderInfo) {
          await this.trader.monitorBuyOrderAndPlaceSellOrder(orderInfo.asset, orderInfo.order_id, orderInfo.price);
        }
      }
    }
  }

  updateBestAssets = async () => {
    try {
      await this.removeAssets();
      const bestAssets = await this.assets.getBestAssetsToTrade(3);
      await redisClient.set(redis.bestAssetsKey, JSON.stringify(bestAssets));
      await redisClient.set(redis.lastUpdatedKey, Date.now());
    } catch (error) {
      console.log("updateAssetsError", error);
    }
  }



}
