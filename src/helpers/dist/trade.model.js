"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var base_model_1 = require("./base.model");
var TradeHelper = /** @class */ (function (_super) {
    __extends(TradeHelper, _super);
    function TradeHelper() {
        return _super.call(this, "identities") || this;
    }
    TradeHelper.prototype.removeAppSettingItem = function (itemId) {
        return __awaiter(this, void 0, void 0, function () {
            var rs, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.callQuery("UPDATE user SET deleted_at IS NULL AND id = " + itemId)];
                    case 1:
                        rs = _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        console.log("Error", error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TradeHelper.prototype.GetOffer = function (offerId) {
        return __awaiter(this, void 0, void 0, function () {
            var pairRes, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.callQuery("CALL GetOffer('" + offerId + "');")];
                    case 1:
                        pairRes = _a.sent();
                        return [2 /*return*/, pairRes];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TradeHelper.prototype.GetAccounts = function (currency) {
        return __awaiter(this, void 0, void 0, function () {
            var pairRes, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.callQuery("CALL spGetAccounts('" + currency + "');")];
                    case 1:
                        pairRes = _a.sent();
                        return [2 /*return*/, pairRes];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TradeHelper.prototype.GetAssets = function (currency) {
        return __awaiter(this, void 0, void 0, function () {
            var pairRes, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.callQuery("CALL spGetAssets('" + currency + "');")];
                    case 1:
                        pairRes = _a.sent();
                        return [2 /*return*/, pairRes];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TradeHelper.prototype.getAdminSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.callQuery("SELECT * FROM app_settings WHERE id=1").then(function (res) {
                    return (res);
                }, function (error) {
                    console.log("Error", error);
                    return false;
                });
                return [2 /*return*/];
            });
        });
    };
    TradeHelper.prototype.GetAsset = function (asset, issuer) {
        return __awaiter(this, void 0, void 0, function () {
            var pairRes, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.callQuery("CALL spGetAsset('" + asset + "', " + issuer + "' );")];
                    case 1:
                        pairRes = _a.sent();
                        return [2 /*return*/, pairRes];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TradeHelper.prototype.saveBalances = function (asset, issuer, action) {
        return __awaiter(this, void 0, void 0, function () {
            var rs, inData, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(action == 'remove')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.callQuery("DELETE FROM  user trading_assets where asset_code = " + asset + " AND asset_issue = " + issuer)];
                    case 1:
                        rs = _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        inData = {
                            asset_code: asset,
                            asset_issue: issuer
                        };
                        return [4 /*yield*/, this.inserData("trading_assets", inData)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_6 = _a.sent();
                        console.log("Add DB Error", error_6);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    TradeHelper.prototype.updateData = function (table, data, updateWhere) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var keys, values, i, key, value;
                        return __generator(this, function (_a) {
                            this.tableName = table;
                            console.log("data", data);
                            this.updateWhere = updateWhere;
                            keys = Object.keys(data);
                            values = Object.values(data);
                            this.insertion = "";
                            for (i = 0; i < keys.length; i++) {
                                console.log("Key: " + keys[i] + ", Value: " + values[i]);
                                key = keys[i];
                                value = values[i];
                                if (this.insertion == "") {
                                    this.insertion += key + "='" + value + "' ";
                                }
                                else {
                                    this.insertion += "," + key + "='" + value + "' ";
                                }
                            }
                            console.log("insertion", this.insertion);
                            this.updateRecords().then(function (res) {
                                return (res);
                            }, function (error) {
                                console.log("QUOTE ERRO::", error);
                                return false;
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    TradeHelper.prototype.inserData = function (table, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var keys, values, i, key, value;
                        return __generator(this, function (_a) {
                            this.tableName = table;
                            console.log("data", data);
                            keys = Object.keys(data);
                            values = Object.values(data);
                            this.insertion = "";
                            for (i = 0; i < keys.length; i++) {
                                console.log("Key: " + keys[i] + ", Value: " + values[i]);
                                key = keys[i];
                                value = values[i];
                                if (this.insertion == "") {
                                    this.insertion += key + "='" + value + "' ";
                                }
                                else {
                                    this.insertion += "," + key + "='" + value + "' ";
                                }
                            }
                            console.log("insertion", this.insertion);
                            this.inserRecords().then(function (res) {
                                return (res);
                            }, function (error) {
                                console.log("QUOTE ERRO::", error);
                                return false;
                            });
                            return [2 /*return*/];
                        });
                    }); })];
            });
        });
    };
    return TradeHelper;
}(base_model_1["default"]));
exports["default"] = TradeHelper;
