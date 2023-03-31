import redisClient from './redisClient';

export async function addOrderId(orderId) {
  try {
    await redisClient.sAdd('running_orders', orderId);
  } catch (err) {
    console.log(`Error adding order ID ${orderId}: ${err.message}`);
  }
}

export async function removeOrderId(orderId) {
  try {
    await redisClient.sRem('running_orders', orderId);
  } catch (err) {
    console.log(`Error removing order ID ${orderId}: ${err.message}`);
  }
}


export async function saveOrderDetails(orderId, asset, price,amount, lastHigh) {
  const orderDetails = {
    time: Date.now(),
    asset: JSON.stringify(asset),
    price: price,
    amount: amount,
    lastHightProfit: lastHigh,
  };
  try {
    await redisClient.hSet(`order_${orderId}`, orderDetails);
  } catch (err) {
    console.log(`Error saving order details for order ID ${orderId}: ${err.message}`);
  }
}

export async function updateLastHighProfit(orderId, lastHighProfit) {
  try {
    await redisClient.hSet(`order_${orderId}`, 'lastHightProfit', lastHighProfit);
  } catch (err) {
    console.log(`Error updating last high profit for order ID ${orderId}: ${err.message}`);
  }
}


export async function removeOrderDetails(orderId) {
  try {
    await redisClient.del(`order_${orderId}`);
  } catch (err) {
    console.log(`Error removing order details for order ID ${orderId}: ${err.message}`);
  }
}


export async function retrieveOrderDetails(orderId) {
  let orderDetails = null;
  try {
    orderDetails = await redisClient.hGetAll(`order_${orderId}`);
  } catch (err) {
    console.log(`Error retrieving order details for order ID ${orderId}: ${err.message}`);
  }
  if (orderDetails) {
    orderDetails.asset = JSON.parse(orderDetails.asset);
  }
  return orderDetails;
}

export async function getAllRunningOrders() {
  let runningOrders = [];
  try {
    runningOrders = await redisClient.sMembers('running_orders');
  } catch (err) {
    console.log(`Error getting all running orders: ${err.message}`);
  }
  return runningOrders;
}
