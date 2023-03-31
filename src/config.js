import dotenv from 'dotenv'
dotenv.config()
export const config = {
  secretKey: process.env.SECRET_KEY,
  publicKey: process.env.PUBLIC_KEY,
  baseAsset: {
    code: 'XLM',
    issuer: null
  },
  quoteAsset:'XLM',

  maxBaseAsset: 1000,
  maxQuoteAsset: 1000,
  tradeThreshold: 0.01,
  strategy: {
    shortInterval: 10,
    longInterval: 20
  },
  horizonServer: process.env.HORIZON_SERVER,
  cron: {
    timezone: process.env.CRON_TIMEZONE
  }
};


export const redis = {
  REDIS_DB_URL:"redis://localhost:6379",
  bestAssetsKey: 'bestAssets',
  lastUpdatedKey: 'lastUpdated',
};
