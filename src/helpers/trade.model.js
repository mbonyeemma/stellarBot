import BaseModel from "./base.model";


class TradeHelper extends BaseModel {
    constructor() {
        super(); // Calls the constructor of the base class (BaseModel)
    }

    async saveOrderDetails(orderType, orderId, sellingAsset, buyingAsset, price, amount, buying_amount, status = 'pending') {

        const orderDetails = {
            offer_id: orderId,
            order_type: orderType,
            selling_asset: sellingAsset,
            buying_asset: buyingAsset,
            ex_rate: price,
            selling_amount: amount,
            buying_amount,
            highest_price: price,
            status: status
        };
        try {
            const tableName = orderType === 'buy' ? 'buy_offers' : 'sell_offers';
            const rsp = await this.inserData(tableName, orderDetails);
            if (rsp == false) {
                await this.updateData(tableName, orderDetails, `selling_asset='${sellingAsset}' AND buying_asset='${buyingAsset}'`);
            }
        } catch (err) {
            // console.error(`Error adding order ID ${orderId}: ${err.message}`);
        }
        return true;
    }

    async removeOrderId(orderId) {
        try {
            await this.deleteRecord('orders', `offer_id='${orderId}'`);
        } catch (err) {
            console.error(`Error removing order ID ${orderId}: ${err.message}`);
        }
        return true;
    }

    async updateOrderStatus(orderId, status, profit = 0) {
        const orderDetails = { status: status, updateOrder: profit };
        try {
            await this.updateData('sell_offers', orderDetails, `offer_id='${orderId}'`);
        } catch (err) {
            console.error(`Error updating order status for order ID ${orderId}: ${err.message}`);
        }
        return true;
    }

    async updateOrderPrice(orderId, price) {
        console.log("price", price)
        try {
            const orderDetails = { "highest_price": price }
            await this.updateData('buy_offers', orderDetails, `buying_asset='${orderId}'`);
        } catch (err) {
            console.error(`Error updating order status for order ID ${orderId}: ${err.message}`);
        }
        return true;
    }

    async updateLastHighProfit(orderId, lastHighProfit) {
        try {
            await this.updateData('orders', { last_high_profit: lastHighProfit }, `offer_id='${orderId}'`);
        } catch (err) {
            console.error(`Error updating last high profit for order ID ${orderId}: ${err.message}`);
        }
        return true;

    }

    async getActiveOrders(orderType) {
        try {

            const tableName = orderType === 'buy' ? 'buy_offers' : 'sell_offers';
            return await this.callQuery(`select * from ${tableName} where status='active' `)

        } catch (err) {
            console.error(`Error retrieving active ${orderType} orders: ${err.message}`);
            return [];
        }
    }

    async retrieveSellOrderDetails(orderId) {
        try {
            const orderDetails = await this.callQuery(`select * from buy_offers where offer_id='${orderId}'`)
            return orderDetails.length > 0 ? orderDetails[0] : null;
        } catch (err) {
            console.error(`Error retrieving order details for order ID ${orderId}: ${err.message}`);
            return null;
        }
    }
    async retrieveOrderDetails(asset) {
        try {
            const orderDetails = await this.callQuery(`select * from buy_offers where buying_asset='${asset}' and status='pending' `)
            return orderDetails.length > 0 ? orderDetails[0] : null;
        } catch (err) {
            console.error(`Error retrieving order details for order ID ${orderId}: ${err.message}`);
            return null;
        }
    }

    async insertAsset(assetCode, assetIssue, assetType = 'basic', status = 'active') {
        const assetDetails = {
            asset_code: assetCode,
            asset_issuer: assetIssue,
            asset_type: assetType,
            status: status,
            // `added_at` is automatically set to CURRENT_TIMESTAMP by the database, so we don't need to include it here.
        };
        try {
            await this.inserData('trading_assets', assetDetails); // Assuming 'assets' is the name of your table
            console.log('Asset inserted successfully');
            return true;
        } catch (err) {
            console.error(`Error inserting asset: ${err.message}`);
            return false;
        }
    }

    async getSavedAsset(asset) {
        return await this.callQuery(`select * from trading_assets where asset_code='${asset}' `)
    }

    async updateManual($asset) {
        return await this.callQuery(`DELETE FROM recommended_assets where asset_code = '${asset}'`);

    }

    async getManualRecommendations() {
        return await this.callQuery(`select * from recommended_assets `)
    }


    async removeAppSettingItem(itemId) {
        try {
            const rs = await this.callQuery(`UPDATE user SET deleted_at IS NULL AND id = ${itemId}`);
            return true;
        } catch (error) {
            console.log("Error", error);
            return false;
        }
    }
    async getBuyOffers() {
        return await this.callQuery(`select * from buy_offers `)

    }
    async GetOffer(offerId) {
        try {
            const pairRes = await this.callQuery(`CALL GetOffer('${offerId}');`);
            return pairRes;
        } catch (error) {
            return false;
        }
    }
    async getSettings() {
        try {
            const pairRes = await this.callQuery(`CALL getSettings();`);
            return pairRes[0];
        } catch (error) {
            return false;
        }
    }



    async GetAccounts(currency) {
        try {
            const pairRes = await this.callQuery(`CALL spGetAccounts('${currency}');`);
            return pairRes;
        } catch (error) {
            return false;
        }
    }

    async GetAssets(currency) {
        try {
            const pairRes = await this.callQuery(`CALL spGetAssets('${currency}');`);
            return pairRes;
        } catch (error) {
            return false;
        }
    }

    async getAdminSettings() {
        this.callQuery(`SELECT * FROM app_settings WHERE id=1`).then(
            (res) => {
                return res;
            },
            (error) => {
                console.log("Error", error);
                return false;
            }
        );
    }

    async GetAsset(asset, issuer) {
        try {
            const pairRes = await this.callQuery(`CALL spGetAsset('${asset}', '${issuer}');`);
            return pairRes;
        } catch (error) {
            return false;
        }
    }

    async spGetAssetToRemove(asset, issuer) {
        try {
            const pairRes = await this.callQuery(`CALL spGetAssetToRemove('${asset}', '${issuer}');`);
            return pairRes;
        } catch (error) {
            return false;
        }
    }

    async saveBalances(asset, issuer, action) {
        try {
            if (action === 'remove') {
                const rs = await this.callQuery(`DELETE FROM trading_assets where asset_code = '${asset}' AND asset_issuer = '${issuer}'`);
                return true;
            } else {
                const inData = {
                    asset_code: asset,
                    asset_issuer: issuer
                };
                await this.inserData("trading_assets", inData);
            }
            return true;
        } catch (error) {
            // console.log("Add DB Error", error);
            return false;
        }
    }

    async updateData(table, data, updateWhere) {
        console.log("sentDaya", table,data,updateWhere)
        if(data ==undefined){
            return false
        }
        return new Promise(async (resolve) => {
            this.tableName = table;

            this.updateWhere = updateWhere;

            const keys = Object.keys(data);
            const values = Object.values(data);
            this.updation = "";
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = values[i];
                if (this.updation === "") {
                    this.updation += `${key}='${value}' `;
                } else {
                    this.updation += `,${key}='${value}' `;
                }
            }
            console.log("insertion", this.updation)

            this.updateRecords().then(
                (res) => {
                    return res;
                },
                (error) => {
                    console.log("QUOTE ERRO::", error);
                    return false;
                }
            );
        });
    }

    async inserData(table, data) {
        return new Promise(async (resolve) => {
            this.tableName = table;

            const keys = Object.keys(data);
            const values = Object.values(data);
            this.insertion = "";
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = values[i];
                if (this.insertion === "") {
                    this.insertion += `${key}='${value}' `;
                } else {
                    this.insertion += `,${key}='${value}' `;
                }
            }

            this.inserRecords().then(
                (res) => {
                    return res;
                },
                (error) => {
                    console.log("QUOTE ERRO::", error);
                    return false;
                }
            );
        });
    }
}

export default new TradeHelper();
