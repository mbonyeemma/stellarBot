import axios from 'axios';
import StellarSdk from 'stellar-sdk';

export default class AssetLookup {
    constructor(server) {
        this.server = server;
        // Configurable weights
        this.weights = {
            volume: 0.5,       // Adjusted to sum to 1
            volatility: 0.4,   // Adjusted to sum to 1
            margin: 0.1        // Adjusted to sum to 1
        }
    }

    async getBestAssetsToTrade(numAssets) {
        try {
            console.log("getBestAssetsToTrade", numAssets);
            let assets = await this.fetchAllAssets();
            const assetMetrics = await Promise.all(assets.map(async (asset) => {
                const metrics = await this.calculateAssetMetrics(asset);
                return { asset, ...metrics };
            }));
            
            assetMetrics.sort((a, b) => {
                return this.weights.volume * (b.volume - a.volume) + 
                       this.weights.volatility * (b.volatility - a.volatility) + 
                       this.weights.margin * (b.margin - a.margin);
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
        const url = 'https://api.stellarterm.com/v1/ticker.json';  // Consider moving this to a configuration or environment variable
        const response = await axios.get(url);

        if (response.data && response.data.assets) {
            // Consider adding more comments about the rationale behind these filters
            const assets = response.data.assets;
            const activeAssets = assets.filter(asset => asset.price_USD < 1 && asset.activityScore > 10 && asset.activityScore < 20 && asset.volume24h_XLM < 200000 );
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
        const baseAsset = this.createAsset("XLM", "") // Consider adding a comment about why XLM is the base asset

        // Fetch trading volume
        const volume = await this.fetchTradingVolume(baseAsset, quoteAsset);
        // Calculate price volatility
        const priceHistory = await this.fetchPriceHistory(baseAsset, quoteAsset);
        const volatility = this.calculateVolatility(priceHistory);
        // Calculate buy-sell margin
        const margin = await this.calculateBuySellMargin(baseAsset, quoteAsset);

        console.log("HERE last item", { volume, volatility, margin });

        return { volume, volatility, margin };
    }

    async fetchTradingVolume(baseAsset, quoteAsset) {
        // Consider adding error handling or retry logic if the Stellar SDK server fails to respond
        const startTime = Date.now() - 24 * 60 * 60 * 1000;
        const endTime = Date.now();
        var resolution = 3600000;
        console.log("fetchTradingVolume", quoteAsset.code);
        var offset = 0;
        let totalVolume = 0;
        try {
            const trRsp = await this.server
                .tradeAggregation(baseAsset, quoteAsset, startTime, endTime, resolution, offset)
                .call();
            trRsp.records.forEach((record) => {
                totalVolume += parseFloat(record.base_volume);
            });
        } catch (error) {
            console.log(error);
        }

        return totalVolume;
    }

    async fetchPriceHistory(baseAsset, quoteAsset) {
        // Consider adding error handling or retry logic if the Stellar SDK server fails to respond
        const startTime = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const endTime = Date.now();
        const resolution = 24 * 60 * 60 * 1000;
        var offset = 0;

        try {
            const tradeAggregation = await this.server
                .tradeAggregation(baseAsset, quoteAsset, startTime, endTime, resolution, offset)
                .call();
            const priceHistory = tradeAggregation.records.map((record) => {
                return parseFloat(record.close);
            });

            return priceHistory;
        } catch (error) {
            console.log("ERROR", error);
            return [];
        }
    }

    calculateVolatility(priceHistory) {
        // Consider adding more sophisticated volatility measures or metrics
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
        // Consider adding error handling or retry logic if the Stellar SDK server fails to respond
        const orderbook = await this.server.orderbook(baseAsset, quoteAsset).call();

        if (orderbook.bids.length === 0 || orderbook.asks.length === 0) {
            return 0;
        }

        const bestBidPrice = parseFloat(orderbook.bids[0].price);
        const bestAskPrice = parseFloat(orderbook.asks[0].price);
        const margin = (bestAskPrice - bestBidPrice) / bestBidPrice;

        return margin;
    }
}
