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
      //const bestAssetsJSON = await redisClient.get(redis.bestAssetsKey);

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



      }, 60000);  // 30000 milliseconds = 30 seconds

    } catch (error) {
      console.error("REDIS ERROR", error);
    }
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


  updateBestAssets = async () => {
    try {

      const assetInfo = await tradeHelper.getManualRecommendations();
      for (let i=0; i<assetInfo.length;i++) {
        console.log(assetInfo[i].asset_code, assetInfo[i].asset_issuer)

        const assetObj = new StellarSdk.Asset(assetInfo[i].asset_code, assetInfo[i].asset_issuer);
        await this.trader.BuyAssets(assetObj);
        await tradeHelper.updateManual(assetInfo[i].asset_code);
      }


      const balances = await this.execution.getBalances();
      if (balances.length > 5) {
        await this.removeAssets(balances);
        this.trader.initialAssetSell();
        console.log(`IN SELLING MODE`)
        return;
      }

      const bestAssets = await this.assets.getBestAssetsToTrade(3);
      console.log("BestAssetsToTrade==>", bestAssets)
      for (const element of bestAssets) {
        const assetObj = new StellarSdk.Asset(element.code, element.issuer);
        const asset = await tradeHelper.getSavedAsset(element.code);
        if (asset.length == 0) {
          await this.trader.BuyAssets(assetObj);
        }
      }
    } catch (error) {
      console.log("updateAssetsError", error);
    }
  }

  removeAssets = async (balances) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight
  
      for (const balance of balances) {
        if (balance.asset_type !== 'native') {
          const asset = balance.asset_code;
          const issuer = balance.asset_issuer;
          const assetBalance = parseFloat(balance.balance);
  
          console.log("asset", asset, issuer, assetBalance)
          const assetData = await tradeHelper.GetAsset(asset, issuer);
          if(assetData.length>0){
          const addedOn = new Date(assetData[0]['added_at']);
          addedOn.setHours(0, 0, 0, 0); // Set time to midnight
          
          // Check if addedOn is not today
          if ((assetData && assetData[0].status === 'remove' || addedOn < today) ) {
            const sellAsset = this.execution.createAsset(asset, issuer);
            await this.trader.removeAsset(sellAsset);
          }
        }
        }
      }
      return true;
    } catch (error) {
      console.log("removeAssetsError", error);
      return false;
    }
  }
  
  

}
