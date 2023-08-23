import BaseModel from "./base.model";
class TradeHelper extends BaseModel {
    constructor() {
        super("identities");
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

    async saveBalances(asset, issuer, action) {
        try {
            if (action === 'remove') {
                const rs = await this.callQuery(`DELETE FROM trading_assets where asset_code = '${asset}' AND asset_issue = '${issuer}'`);
                return true;
            }
            const inData = {
                asset_code: asset,
                asset_issue: issuer
            };
            await this.inserData("trading_assets", inData);
            return true;
        } catch (error) {
            console.log("Add DB Error", error);
            return false;
        }
    }

    async updateData(table, data, updateWhere) {
        return new Promise(async (resolve) => {
            this.tableName = table;

            this.updateWhere = updateWhere;

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
