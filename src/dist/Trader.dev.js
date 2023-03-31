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

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
      var publicKey, secretKey, keypair, account, assetPrice, quoteAssetBalance, amount, result, isDeleted;
      return regeneratorRuntime.async(function init$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log("step1");
              publicKey = _config.config.publicKey;
              secretKey = _config.config.secretKey;
              keypair = _stellarSdk.Keypair.fromSecret(secretKey);
              _context.next = 6;
              return regeneratorRuntime.awrap(server.loadAccount(publicKey));

            case 6:
              account = _context.sent;
              _context.next = 9;
              return regeneratorRuntime.awrap(this.hasTrustLine(account, assetToBuy));

            case 9:
              if (_context.sent) {
                _context.next = 13;
                break;
              }

              console.log("Adding trustline for asset: ".concat(assetToBuy.code));
              _context.next = 13;
              return regeneratorRuntime.awrap(this.addTrustLine(server, account, assetToBuy, keypair));

            case 13:
              _context.next = 15;
              return regeneratorRuntime.awrap(execution.getAssetPrice(assetToBuy));

            case 15:
              assetPrice = _context.sent;
              _context.next = 18;
              return regeneratorRuntime.awrap(execution.getAssetBalance(_config.config.quoteAsset));

            case 18:
              quoteAssetBalance = _context.sent;
              console.log("Asset to buy: ".concat(assetToBuy.code, ", Asset price: ").concat(assetPrice, ", Quote asset balance: ").concat(quoteAssetBalance));
              console.log("step ", 2);
              amount = (quoteAssetBalance * 0.1 / assetPrice).toFixed(7);
              console.log("amount", amount);
              _context.next = 25;
              return regeneratorRuntime.awrap(execution.placeBuyOrder(assetToBuy, amount, assetPrice));

            case 25:
              result = _context.sent;
              console.log('Buy order result:', result);

              if (!(result !== false)) {
                _context.next = 33;
                break;
              }

              _context.next = 30;
              return regeneratorRuntime.awrap(execution.deleteAllSellOffersForAsset(assetToBuy));

            case 30:
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

            case 33:
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
    value: function addTrustLine(server, account, asset, keypair) {
      var assetObj, trustlineOperation, transaction, result;
      return regeneratorRuntime.async(function addTrustLine$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              assetObj = new _stellarSdk["default"].Asset(asset.code, asset.issuer);
              trustlineOperation = _stellarSdk["default"].Operation.changeTrust({
                asset: assetObj,
                limit: '100000000' // Set a limit for the trust line

              });
              transaction = new _stellarSdk["default"].TransactionBuilder(account, {
                fee: _stellarSdk["default"].BASE_FEE,
                networkPassphrase: _stellarSdk["default"].Networks.PUBLIC
              }).addOperation(trustlineOperation).setTimeout(180).build();
              transaction.sign(keypair);
              _context3.next = 6;
              return regeneratorRuntime.awrap(server.submitTransaction(transaction));

            case 6:
              result = _context3.sent;
              return _context3.abrupt("return", result);

            case 8:
            case "end":
              return _context3.stop();
          }
        }
      });
    }
  }, {
    key: "sellAssetOnMarket",
    value: function sellAssetOnMarket(assetToSell) {
      var isDeleted, baseAsset, orderbook, assetBalance, sellPrice, sellAmount, sellResult;
      return regeneratorRuntime.async(function sellAssetOnMarket$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return regeneratorRuntime.awrap(execution.deleteAllSellOffersForAsset(assetToSell));

            case 3:
              isDeleted = _context4.sent;
              baseAsset = execution.createAsset("XLM", "");
              _context4.next = 7;
              return regeneratorRuntime.awrap(server.orderbook(assetToSell, baseAsset).call());

            case 7:
              orderbook = _context4.sent;
              console.log("DATA HERE::::", orderbook);
              _context4.next = 11;
              return regeneratorRuntime.awrap(execution.getAssetBalance(assetToSell));

            case 11:
              assetBalance = _context4.sent;
              _context4.next = 14;
              return regeneratorRuntime.awrap(this.calculateSellPrice(orderbook, assetBalance, null, null));

            case 14:
              sellPrice = _context4.sent;
              console.log("sellPrice", sellPrice);
              sellAmount = assetBalance;
              _context4.next = 19;
              return regeneratorRuntime.awrap(execution.placeSellOrder(assetToSell, sellAmount, sellPrice, 0));

            case 19:
              sellResult = _context4.sent;
              console.log("Sell order placed at ".concat(sellPrice, "."), sellResult);
              _context4.next = 26;
              break;

            case 23:
              _context4.prev = 23;
              _context4.t0 = _context4["catch"](0);
              console.log("ERRO 2", _context4.t0);

            case 26:
              return _context4.abrupt("return", true);

            case 27:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[0, 23]]);
    }
  }, {
    key: "monitorBuyOrderAndPlaceSellOrder",
    value: function monitorBuyOrderAndPlaceSellOrder(assetToBuy, buyOrderId, buyPrice) {
      var existingDetails, minimumExitProfit, increment, updateMinimumExitProfit, assetPrice, isDeleted, orderbook, AssetBalance, sellPrice, sellAmount, currentProfit, sellResult;
      return regeneratorRuntime.async(function monitorBuyOrderAndPlaceSellOrder$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              _context6.next = 3;
              return regeneratorRuntime.awrap(helper.retrieveOrderDetails(buyOrderId));

            case 3:
              existingDetails = _context6.sent;
              minimumExitProfit = existingDetails.lastHightProfit;

              increment = function increment(currentProfit) {
                return Math.floor((currentProfit - 0.01) * 100) / 100;
              };

              updateMinimumExitProfit = function updateMinimumExitProfit(currentProfit) {
                return regeneratorRuntime.async(function updateMinimumExitProfit$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        if (!(currentProfit >= minimumExitProfit)) {
                          _context5.next = 4;
                          break;
                        }

                        _context5.next = 3;
                        return regeneratorRuntime.awrap(helper.updateLastHighProfit(buyOrderId, currentProfit));

                      case 3:
                        return _context5.abrupt("return", currentProfit);

                      case 4:
                        return _context5.abrupt("return", minimumExitProfit);

                      case 5:
                      case "end":
                        return _context5.stop();
                    }
                  }
                });
              };

              _context6.next = 9;
              return regeneratorRuntime.awrap(execution.deleteAllSellOffersForAsset(assetToBuy));

            case 9:
              isDeleted = _context6.sent;
              _context6.next = 12;
              return regeneratorRuntime.awrap(server.orderbook(_config.config.quoteAsset, assetToBuy).call());

            case 12:
              orderbook = _context6.sent;
              _context6.next = 15;
              return regeneratorRuntime.awrap(execution.getAssetBalance(assetToBuy));

            case 15:
              AssetBalance = _context6.sent;
              sellPrice = this.calculateSellPrice(orderbook, AssetBalance, buyPrice);
              assetPrice = parseFloat(orderbook.bids[0].price);
              sellAmount = (0.5 * AssetBalance).toFixed(6);
              currentProfit = (assetPrice - buyPrice) / buyPrice;
              _context6.next = 22;
              return regeneratorRuntime.awrap(execution.placeSellOrder(assetToBuy, sellAmount, sellPrice, 0));

            case 22:
              sellResult = _context6.sent;
              sellOfferId = sellResult;
              console.log("Sell order placed at ".concat(sellPrice, ". Profit: ").concat(minimumExitProfit * 100, "%"), sellResult);
              minimumExitProfit = updateMinimumExitProfit(currentProfit);
              return _context6.abrupt("return", minimumExitProfit);

            case 29:
              _context6.prev = 29;
              _context6.t0 = _context6["catch"](0);
              console.log("MONITOR ERROR", _context6.t0);

            case 32:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this, [[0, 29]]);
    }
  }, {
    key: "calculateSellPrice",
    value: function calculateSellPrice(orderbook, amount, Price) {
      var accumulatedAmount, topBuyPrice, topBuyAmount, i, buy, askPrice, _i, ask, option2Price, sellPrice;

      return regeneratorRuntime.async(function calculateSellPrice$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              accumulatedAmount = 0;
              topBuyPrice = Price;
              topBuyAmount = amount;
              i = 0;

            case 4:
              if (!(i < orderbook.bids.length)) {
                _context7.next = 14;
                break;
              }

              buy = orderbook.bids[i];
              accumulatedAmount += parseFloat(buy.amount);

              if (!(accumulatedAmount >= amount * 0.3)) {
                _context7.next = 11;
                break;
              }

              topBuyPrice = parseFloat(buy.price);
              topBuyAmount = accumulatedAmount;
              return _context7.abrupt("break", 14);

            case 11:
              i++;
              _context7.next = 4;
              break;

            case 14:
              if (!(!topBuyPrice || !topBuyAmount)) {
                _context7.next = 16;
                break;
              }

              return _context7.abrupt("return", null);

            case 16:
              // Find the highest ask price where the amount is more than 30% of the total asks
              askPrice = 0;
              _i = 0;

            case 18:
              if (!(_i < orderbook.asks.length)) {
                _context7.next = 26;
                break;
              }

              ask = orderbook.asks[_i];

              if (!(parseFloat(ask.amount) >= topBuyAmount)) {
                _context7.next = 23;
                break;
              }

              askPrice = parseFloat(ask.price);
              return _context7.abrupt("break", 26);

            case 23:
              _i++;
              _context7.next = 18;
              break;

            case 26:
              // If the ask price is 0, use the second lowest ask price
              if (askPrice === 0 && orderbook.asks.length >= 2) {
                askPrice = parseFloat(orderbook.asks[1].price);
              }

              option2Price = askPrice * 1.03;
              console.log("option1Price", topBuyPrice, "option2Price", option2Price);
              sellPrice = Math.min(topBuyPrice, option2Price);
              return _context7.abrupt("return", sellPrice);

            case 31:
            case "end":
              return _context7.stop();
          }
        }
      });
    }
  }]);

  return Trader;
}();

exports["default"] = Trader;