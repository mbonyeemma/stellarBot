import StellarSdk, { Asset } from 'stellar-sdk';
import { config } from './config';
import axios from 'axios';
const { horizonServer, baseAsset } = config
const _quoteAsset = baseAsset;
var server = new StellarSdk.Server("https://horizon.stellar.org");

export default class AssetLookup {
    constructor(server) {
        this.server = server;
    }
    async getBestAssetsToTrade(numAssets = 5) {
        try {
            console.log("getBestAssetsToTrade", numAssets);
            let assets = await this.fetchAllAssets();
            const assetMetrics = await Promise.all(assets.map(async (asset) => {
                const metrics = await this.calculateAssetMetrics(asset);
                return { asset, ...metrics };
            }));
            assetMetrics.sort((a, b) => {
                const volumeDiff = b.volume - a.volume;
                const volatilityDiff = b.volatility - a.volatility;
                const marginDiff = b.margin - a.margin;
                const volumeWeight = 0.2;
                const volatilityWeight = 0.8;
                const marginWeight = 0.1;

                return volumeWeight * volumeDiff + volatilityWeight * volatilityDiff + marginWeight * marginDiff;
            });
            return assetMetrics.slice(0, numAssets).map(metric => metric.asset);
        } catch (error) {
            console.error('Error fetching best assets to trade:', error);
            return [];
        }
    }
    async fetchAllAssets() {
        const activeAssets = await this.getAssetsWithVolume();
        console.log("activeAssets", activeAssets)
        return activeAssets;
    }

    async getAssetsWithVolume() {
        const url = 'https://api.stellarterm.com/v1/ticker.json';
        const response = await axios.get(url);

        if (response.data && response.data.assets) {
            const assets = response.data.assets;
            const activeAssets = assets.filter(asset => asset.price_USD < 1 && asset.activityScore > 10 && asset.activityScore < 20 && asset.volume24h_XLM < 200000);
            return activeAssets;
        } else {
            throw new Error('Failed to fetch assets from StellarTerm API');
        }
    }
    createAsset(assetCode, issuerPublicKey) {
        if (assetCode === 'XLM') {
            return StellarSdk.Asset.native();
        } else {
            return new StellarSdk.Asset(assetCode, issuerPublicKey);
        }
    }
    async calculateAssetMetrics(asset) {
        const quoteAsset = this.createAsset(asset.code, asset.issuer);
        const baseAsset = this.createAsset("XLM", "")

        // Fetch trading volume
        const volume = await this.fetchTradingVolume(baseAsset, quoteAsset);
        // Calculate price volatility
        const priceHistory = await this.fetchPriceHistory(baseAsset, quoteAsset);
        const volatility = this.calculateVolatility(priceHistory);
        // Calculate buy-sell margin
        const margin = await this.calculateBuySellMargin(baseAsset, quoteAsset);

        console.log("HERE last item", { volume, volatility, margin })

        return { volume, volatility, margin };
    }

    async fetchTradingVolume(baseAsset, quoteAsset) {
        const startTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
        const endTime = Date.now();
        var resolution = 3600000;
        console.log("fetchTradingVolume", quoteAsset.code)
        var offset = 0;
        let totalVolume = 0;
        try {
            const trRsp = await server
                .tradeAggregation(baseAsset, quoteAsset, startTime, endTime, resolution, offset)
                .call();
            trRsp.records.forEach((record) => {
                totalVolume += parseFloat(record.base_volume);
            });

        } catch (error) {
            console.log(error)
        }



        return totalVolume;
    }

    async fetchPriceHistory(baseAsset, quoteAsset) {
        const startTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
        const endTime = Date.now();
        const resolution = 24 * 60 * 60 * 1000; // 1-day resolution
        var offset = 0;

        try {
            const tradeAggregation = await server
                .tradeAggregation(baseAsset, quoteAsset, startTime, endTime, resolution, offset)
                .call();
            const priceHistory = tradeAggregation.records.map((record) => {
                return parseFloat(record.close);
            });

            return priceHistory;
        } catch (error) {
            console.log("ERROR", error)
            return []

        }



    }

    calculateVolatility(priceHistory) {
        if (priceHistory.length < 2) {
            return 0;
        }

        let sum = 0;
        let sumOfSquares = 0;

        for (let i = 1; i < priceHistory.length; i++) {
            const dailyReturn = (priceHistory[i] - priceHistory[i - 1]) / priceHistory[i - 1];
            sum += dailyReturn;
            sumOfSquares += dailyReturn * dailyReturn;
        }

        const mean = sum / (priceHistory.length - 1);
        const variance = sumOfSquares / (priceHistory.length - 1) - mean * mean;

        return Math.sqrt(variance);
    }

    async calculateBuySellMargin(baseAsset, quoteAsset) {
        // Fetch the order book
        const orderbook = await server.orderbook(baseAsset, quoteAsset).call();

        if (orderbook.bids.length === 0 || orderbook.asks.length === 0) {
            return 0;
        }

        // Get the best bid and ask prices
        const bestBidPrice = parseFloat(orderbook.bids[0].price);
        const bestAskPrice = parseFloat(orderbook.asks[0].price);

        // Calculate the margin as a percentage
        const margin = (bestAskPrice - bestBidPrice) / bestBidPrice;

        return margin;
    }
}

