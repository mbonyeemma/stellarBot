/* eslint-disable no-console */
import { createClient } from 'redis'
import dotenv from 'dotenv'
dotenv.config()
const redisUrl = process.env.REDIS_DB_URL
const redisClient = createClient({
  url: redisUrl,
})
const connectRedis = async () => {
  try {
    await redisClient.connect()
  } catch (err) {
    console.log(err.message)
    setTimeout(connectRedis, 5000)
  }
}
connectRedis()
redisClient.on('connect', () => console.log('Redis client connected...'))
redisClient.on('error', (err) => console.log(err))


export default redisClient
