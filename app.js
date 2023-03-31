import express from 'express';
import Trader from './src/Trader.js';
import { redis } from './src/config.js';
import redisClient from './src/redisClient.js';
import CronService from './src/CronService.js';

const app = express();
const port = process.env.PORT || 3000;


redisClient.on('connect', () => {
    new CronService();
  });
  
app.listen(port, () => {
    console.log(`App is listening on port ${port}.`);

});