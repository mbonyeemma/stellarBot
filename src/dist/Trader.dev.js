"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Execution = _interopRequireDefault(require("./Execution.js"));

var _config = require("./config.js");

var helper = _interopRequireWildcard(require("./Helper.js"));

var _stellarSdk = _interopRequireWildcard(require("stellar-sdk"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_dotenv["default"].config();

var server = new _stellarSdk["default"].Server("https://horizon.stellar.org");
var execution = new _Execution["default"]();

var Trader =
/*#__PURE__*/
function () {
  function Trader() {
    _classCallCheck(this, Trader);
  }

  _createClass(Trader, [{
    key: "init",
    value: function init(assetToBuy) {
      var publicKey, secretKey, account, assetPrice, quoteAssetBalance, amount, result, isDeleted;
      return regeneratorRuntime.async(function init$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log("started the init function with asset,", assetToBuy);
              publicKey = _config.config.publicKey;
              secretKey = _config.config.secretKey;
              _context.next = 5;
              return regeneratorRuntime.awrap(server.loadAccount(publicKey));

            case 5:
              account = _context.sent;
              _context.next = 8;
              return regeneratorRuntime.awrap(this.hasTrustLine(account, assetToBuy));

            case 8:
              if (_context.sent) {
                _context.next = 12;
                break;
              }

              console.log("Adding trustline for asset: ".concat(assetToBuy.code));
              _context.next = 12;
              return regeneratorRuntime.awrap(this.addTrustLine(assetToBuy, "100000000"));

            case 12:
              _context.next = 14;
              return regeneratorRuntime.awrap(execution.getAssetPrice(assetToBuy));

            case 14:
              assetPrice = _context.sent;
              _context.next = 17;
              return regeneratorRuntime.awrap(execution.getAssetBalance(_config.config.quoteAsset));

            case 17:
              quoteAssetBalance = _context.sent;
              console.log("Asset to buy: ".concat(assetToBuy.code, ", Asset price: ").concat(assetPrice, ", Quote asset balance: ").concat(quoteAssetBalance));
              console.log("step ", 2);

              if (!(quoteAssetBalance < 20)) {
                _context.next = 23;
                break;
              }

              console.log("not enough funds to trade");
              return _context.abrupt("return", true);

            case 23:
              amount = (quoteAssetBalance * 0.4 / assetPrice).toFixed(7);
              console.log("amount", amount);
              _context.next = 27;
              return regeneratorRuntime.awrap(execution.placeBuyOrder(assetToBuy, amount, assetPrice));

            case 27:
              result = _context.sent;
              console.log('Buy order result:', result);

              if (!(result !== false)) {
                _context.next = 35;
                break;
              }

              _context.next = 32;
              return regeneratorRuntime.awrap(execution.deleteAllSellOffersForAsset(assetToBuy));

            case 32:
              isDeleted = _context.sent;

              if (isDeleted) {
                helper.addOrderId(result);
                helper.saveOrderDetails(result, assetToBuy.code, assetPrice, amount, 0);
              }

              console.log("Offer saved to redis", {
                result: result,
                assetToBuy: assetToBuy,
                assetPrice: assetPrice
              });

            case 35:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "hasTrustLine",
    value: function hasTrustLine(account, asset) {
      return regeneratorRuntime.async(function hasTrustLine$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", account.balances.some(function (balance) {
                return balance.asset_code === asset.code && balance.asset_issuer === asset.issuer;
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      });
    }
  }, {
    key: "addTrustLine",
    value: function addTrustLine(asset, limit) {
      var publicKey, secretKey, account, keypair, assetObj, trustlineOperation, transaction, result;
      return regeneratorRuntime.async(function addTrustLine$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              publicKey = _config.config.publicKey;
              secretKey = _config.config.secretKey;
              _context3.next = 5;
              return regeneratorRuntime.awrap(server.loadAccount(publicKey));

            case 5:
              account = _context3.sent;
              keypair = _stellarSdk.Keypair.fromSecret(secretKey);
              assetObj = new _stellarSdk["default"].Asset(asset.code, asset.issuer);
              trustlineOperation = _stellarSdk["default"].Operation.changeTrust({
                asset: assetObj,
                limit: limit // Set a limit for the trust line

              });
              transaction = new _stellarSdk["default"].TransactionBuilder(account, {
                fee: _stellarSdk["default"].BASE_FEE,
                networkPassphrase: _stellarSdk["default"].Networks.PUBLIC
              }).addOperation(trustlineOperation).setTimeout(180).build();
              transaction.sign(keypair);
              _context3.next = 13;
              return regeneratorRuntime.awrap(server.submitTransaction(transaction));

            case 13:
              result = _context3.sent;
              return _context3.abrupt("return", result);

            case 17:
              _context3.prev = 17;
              _context3.t0 = _context3["catch"](0);
              return _context3.abrupt("return", false);

            case 20:
            case "end":
              return _context3.stop();
          }
        }
      }, null, null, [[0, 17]]);
    }
  }, {
    key: "removeAsset",
    value: function removeAsset(assetToSell) {
      var issuerAddress, nsAsset, isDeleted, assetBalance, sellPrice, sellResult;
      return regeneratorRuntime.async(function removeAsset$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              // return true;
              issuerAddress = process.env.wIssuer;
              nsAsset = process.env.wAsset;

              if (!(assetToSell.code != nsAsset && assetToSell.issuer != issuerAddress)) {
                _context4.next = 29;
                break;
              }

              _context4.next = 6;
              return regeneratorRuntime.awrap(execution.deleteAllSellOffersForAsset(assetToSell));

            case 6:
              isDeleted = _context4.sent;
              _context4.next = 9;
              return regeneratorRuntime.awrap(execution.getAssetBalance(assetToSell));

            case 9:
              assetBalance = _context4.sent;
              sellPrice = "0.0000001";
              sellResult = false;

              if (!(assetBalance > 0)) {
                _context4.next = 25;
                break;
              }

              _context4.next = 15;
              return regeneratorRuntime.awrap(execution.StrictSendTransaction(assetToSell, assetBalance));

            case 15:
              sellResult = _context4.sent;
              console.log("Strictr send placed at ".concat(sellPrice, "."), sellResult);

              if (!(sellResult !== false)) {
                _context4.next = 21;
                break;
              }

              sellResult = true;
              _context4.next = 25;
              break;

            case 21:
              _context4.next = 23;
              return regeneratorRuntime.awrap(execution.placeSellOrder(assetToSell, assetBalance, sellPrice, 0));

            case 23:
              sellResult = _context4.sent;
              console.log("Sell order placed at ".concat(sellPrice, "."), sellResult);

            case 25:
              if (!sellResult) {
                _context4.next = 29;
                break;
              }

              _context4.next = 28;
              return regeneratorRuntime.awrap(this.addTrustLine(assetToSell, "0"));

            case 28:
              console.log('Asset Removed', assetToSell);

            case 29:
              _context4.next = 34;
              break;

            case 31:
              _context4.prev = 31;
              _context4.t0 = _context4["catch"](0);
              console.log("ERROR REMOVING ASSET", _context4.t0);

            case 34:
              return _context4.abrupt("return", true);

            case 35:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[0, 31]]);
    }
  }, {
    key: "sellAssetOnMarket",
    value: function sellAssetOnMarket(assetToSell, command) {
      var isDeleted, baseAsset, orderbook, assetBalance, sellPrice, sellAmount, sellResult;
      return regeneratorRuntime.async(function sellAssetOnMarket$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return regeneratorRuntime.awrap(execution.deleteAllSellOffersForAsset(assetToSell));

            case 3:
              isDeleted = _context5.sent;
              baseAsset = execution.createAsset("XLM", "");
              _context5.next = 7;
              return regeneratorRuntime.awrap(server.orderbook(assetToSell, baseAsset).call());

            case 7:
              orderbook = _context5.sent;
              _context5.next = 10;
              return regeneratorRuntime.awrap(execution.getAssetBalance(assetToSell));

            case 10:
              assetBalance = _context5.sent;
              _context5.next = 13;
              return regeneratorRuntime.awrap(this.calculateSellPrice(orderbook, assetBalance, null, null));

            case 13:
              sellPrice = _context5.sent;

              if (command == "liquidate") {
                sellPrice = "0.0000001";
              }

              console.log("sellPrice", sellPrice);
              sellAmount = assetBalance;
              sellPrice = sellPrice.toFixed(7);

              if (!(sellPrice > 0)) {
                _context5.next = 25;
                break;
              }

              _context5.next = 21;
              return regeneratorRuntime.awrap(execution.placeSellOrder(assetToSell, sellAmount, sellPrice, 0));

            case 21:
              sellResult = _context5.sent;
              console.log("Sell order placed at ".concat(sellPrice, "."), sellResult);
              _context5.next = 26;
              break;

            case 25:
              console.log("Sell order NOT placed at ".concat(sellPrice, "."));

            case 26:
              _context5.next = 31;
              break;

            case 28:
              _context5.prev = 28;
              _context5.t0 = _context5["catch"](0);
              console.log("ERRO 2", _context5.t0);

            case 31:
              return _context5.abrupt("return", true);

            case 32:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this, [[0, 28]]);
    }
  }, {
    key: "monitorBuyOrderAndPlaceSellOrder",
    value: function monitorBuyOrderAndPlaceSellOrder(assetToBuy, buyOrderId, buyPrice) {
      var existingDetails, minimumExitProfit, increment, updateMinimumExitProfit, assetPrice, isDeleted, orderbook, AssetBalance, sellPrice, sellAmount, currentProfit, sellResult;
      return regeneratorRuntime.async(function monitorBuyOrderAndPlaceSellOrder$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _context7.next = 3;
              return regeneratorRuntime.awrap(helper.retrieveOrderDetails(buyOrderId));

            case 3:
              existingDetails = _context7.sent;
              minimumExitProfit = existingDetails.lastHightProfit;

              increment = function increment(currentProfit) {
                return Math.floor((currentProfit - 0.01) * 100) / 100;
              };

              updateMinimumExitProfit = function updateMinimumExitProfit(currentProfit) {
                return regeneratorRuntime.async(function updateMinimumExitProfit$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        if (!(currentProfit >= minimumExitProfit)) {
                          _context6.next = 4;
                          break;
                        }

                        _context6.next = 3;
                        return regeneratorRuntime.awrap(helper.updateLastHighProfit(buyOrderId, currentProfit));

                      case 3:
                        return _context6.abrupt("return", currentProfit);

                      case 4:
                        return _context6.abrupt("return", minimumExitProfit);

                      case 5:
                      case "end":
                        return _context6.stop();
                    }
                  }
                });
              };

              _context7.next = 9;
              return regeneratorRuntime.awrap(execution.deleteAllSellOffersForAsset(assetToBuy));

            case 9:
              isDeleted = _context7.sent;
              _context7.next = 12;
              return regeneratorRuntime.awrap(server.orderbook(_config.config.quoteAsset, assetToBuy).call());

            case 12:
              orderbook = _context7.sent;
              _context7.next = 15;
              return regeneratorRuntime.awrap(execution.getAssetBalance(assetToBuy));

            case 15:
              AssetBalance = _context7.sent;
              sellPrice = this.calculateSellPrice(orderbook, AssetBalance, buyPrice);
              assetPrice = parseFloat(orderbook.bids[0].price);
              sellAmount = (0.5 * AssetBalance).toFixed(6);
              currentProfit = (assetPrice - buyPrice) / buyPrice;
              _context7.next = 22;
              return regeneratorRuntime.awrap(execution.placeSellOrder(assetToBuy, sellAmount, sellPrice, 0));

            case 22:
              sellResult = _context7.sent;
              sellOfferId = sellResult;
              console.log("Sell order placed at ".concat(sellPrice, ". Profit: ").concat(minimumExitProfit * 100, "%"), sellResult);
              minimumExitProfit = updateMinimumExitProfit(currentProfit);
              return _context7.abrupt("return", minimumExitProfit);

            case 29:
              _context7.prev = 29;
              _context7.t0 = _context7["catch"](0);
              console.log("MONITOR ERROR", _context7.t0);

            case 32:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[0, 29]]);
    }
  }, {
    key: "calculateSellPrice",
    value: function calculateSellPrice(orderbook, amount, Price) {
      var accumulatedAmount, topBuyPrice, topBuyAmount, i, buy, askPrice, _i, ask, option2Price, sellPrice;

      return regeneratorRuntime.async(function calculateSellPrice$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              accumulatedAmount = 0;
              topBuyPrice = Price;
              topBuyAmount = amount;
              i = 0;

            case 4:
              if (!(i < orderbook.asks.length)) {
                _context8.next = 15;
                break;
              }

              buy = orderbook.asks[i];
              accumulatedAmount += parseFloat(buy.amount);
              console.log("accumulatedAmount", accumulatedAmount);

              if (!(accumulatedAmount >= amount * 0.3)) {
                _context8.next = 12;
                break;
              }

              topBuyPrice = parseFloat(buy.price);
              topBuyAmount = accumulatedAmount;
              return _context8.abrupt("break", 15);

            case 12:
              i++;
              _context8.next = 4;
              break;

            case 15:
              if (!(!topBuyPrice || !topBuyAmount)) {
                _context8.next = 17;
                break;
              }

              return _context8.abrupt("return", 0.1);

            case 17:
              // Find the highest ask price where the amount is more than 30% of the total asks
              askPrice = 0;
              _i = 0;

            case 19:
              if (!(_i < orderbook.asks.length)) {
                _context8.next = 27;
                break;
              }

              ask = orderbook.asks[_i];

              if (!(parseFloat(ask.amount) >= topBuyAmount)) {
                _context8.next = 24;
                break;
              }

              askPrice = parseFloat(ask.price);
              return _context8.abrupt("break", 27);

            case 24:
              _i++;
              _context8.next = 19;
              break;

            case 27:
              // If the ask price is 0, use the second lowest ask price
              if (askPrice === 0 && orderbook.asks.length >= 2) {
                askPrice = parseFloat(orderbook.asks[1].price);
              }

              option2Price = askPrice * 1.03;
              console.log("option1Price", topBuyPrice, "option2Price", option2Price);
              sellPrice = Math.min(topBuyPrice, option2Price);
              return _context8.abrupt("return", sellPrice - 0.0000002);

            case 32:
            case "end":
              return _context8.stop();
          }
        }
      });
    }
  }]);

  return Trader;
}();

exports["default"] = Trader;