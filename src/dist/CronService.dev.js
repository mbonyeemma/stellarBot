"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _nodeCron = _interopRequireDefault(require("node-cron"));

var _AssetLookup = _interopRequireDefault(require("./AssetLookup.js"));

var _config = require("./config");

var _redisClient = _interopRequireDefault(require("./redisClient"));

var helper = _interopRequireWildcard(require("./Helper.js"));

var _Trader = _interopRequireDefault(require("./Trader.js"));

var _stellarSdk = _interopRequireWildcard(require("stellar-sdk"));

var _Execution = _interopRequireDefault(require("./Execution.js"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var serverUrl = 'https://horizon.stellar.org';
var publicKey = 'GANDGDF7ZHF7RVXMI53PUSCMVWEFANGTZ4RLEH2DGPDFI5BGWYOLAXRR';
var url = "".concat(serverUrl, "/assets?asset_issuer=").concat(publicKey, "&limit=200");
var execution = new _Execution["default"]();
var trader = new _Trader["default"]();
var isInit = true;

var CronService =
/*#__PURE__*/
function () {
  function CronService() {
    _classCallCheck(this, CronService);

    this.assets = new _AssetLookup["default"]();
    this.init();
    this.placeInitialOrder(); //this.offersCron();

    this.sellAssets();
    this.checkCoinLoop();
  } // EVERY MINUTE


  _createClass(CronService, [{
    key: "placeInitialOrder",
    value: function placeInitialOrder() {
      return regeneratorRuntime.async(function placeInitialOrder$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log("BUYING Assets every MINUTE");

              _nodeCron["default"].schedule('*/5 * * * *', this.buyAssets, {
                scheduled: true
              });

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    } // EVERY 2 MINUTES

  }, {
    key: "sellAssets",
    value: function sellAssets() {
      return regeneratorRuntime.async(function sellAssets$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              console.log("sellAssets every 2 minutes...");

              _nodeCron["default"].schedule('*/2 * * * *', this.sellAssetOnMarket, {
                scheduled: true
              });

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    } // EVERY 1 HOUR

  }, {
    key: "checkCoinLoop",
    value: function checkCoinLoop() {
      return regeneratorRuntime.async(function checkCoinLoop$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              console.log("Checking the coins every hour"); // THIS IS TO CHECK THE ISSUER ACCOUNT AND SEND EMMA AN SMS

              _nodeCron["default"].schedule('*/30 * * * *', this.trackClicCoins, {
                scheduled: true
              });

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    } // EVERY 30 SECONDS. NOT USED FOR NOW

  }, {
    key: "offersCron",
    value: function offersCron() {
      return regeneratorRuntime.async(function offersCron$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log("offersWorker, every 30 secods");

              _nodeCron["default"].schedule('*/30 * * * * *', this.offersWorker, {
                scheduled: true
              });

            case 2:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "buyAssets",
    value: function buyAssets() {
      var bestAssetsJSON, bestAssets;
      return regeneratorRuntime.async(function buyAssets$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(_redisClient["default"].get(_config.redis.bestAssetsKey));

            case 2:
              bestAssetsJSON = _context6.sent;

              if (bestAssetsJSON) {
                bestAssets = JSON.parse(bestAssetsJSON);
                bestAssets.forEach(function _callee(element) {
                  var asset, assetObj;
                  return regeneratorRuntime.async(function _callee$(_context5) {
                    while (1) {
                      switch (_context5.prev = _context5.next) {
                        case 0:
                          asset = element;
                          console.log("bestAsset", asset);
                          assetObj = new _stellarSdk["default"].Asset(asset.code, asset.issuer);
                          _context5.next = 5;
                          return regeneratorRuntime.awrap(trader.init(assetObj));

                        case 5:
                        case "end":
                          return _context5.stop();
                      }
                    }
                  });
                });
              }

            case 4:
            case "end":
              return _context6.stop();
          }
        }
      });
    }
  }, {
    key: "init",
    value: function init() {
      var bestAssetsJSON;
      return regeneratorRuntime.async(function init$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _context7.next = 3;
              return regeneratorRuntime.awrap(_redisClient["default"].del(_config.redis.bestAssetsKey));

            case 3:
              isInit = false;
              console.log("Starting cron service to update best assets...");
              _context7.next = 7;
              return regeneratorRuntime.awrap(_redisClient["default"].get(_config.redis.bestAssetsKey));

            case 7:
              bestAssetsJSON = _context7.sent;
              console.log("bestAssetsJSON", bestAssetsJSON);

              if (!(!bestAssetsJSON || bestAssetsJSON.length < 3)) {
                _context7.next = 13;
                break;
              }

              console.log("Best assets data not found in Redis. Updating immediately...");
              _context7.next = 13;
              return regeneratorRuntime.awrap(this.updateBestAssets());

            case 13:
              this.removeAssets(); // EVERY DAY

              _nodeCron["default"].schedule('0 0 * * *', this.updateBestAssets, {
                scheduled: true
              });

              _context7.next = 25;
              break;

            case 17:
              _context7.prev = 17;
              _context7.t0 = _context7["catch"](0);
              console.log("REDIS ERROR", _context7.t0);

              if (!isInit) {
                _context7.next = 25;
                break;
              }

              console.log("sleeping for 10 sec and try AGAIN");
              _context7.next = 24;
              return regeneratorRuntime.awrap(this.sleep(10000000));

            case 24:
              this.init();

            case 25:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[0, 17]]);
    }
  }, {
    key: "removeAssets",
    value: function removeAssets() {
      var balances, AssetsToRemove, i, balance, asset_type, asset, issuer, sellAsset, assetBalance;
      return regeneratorRuntime.async(function removeAssets$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(execution.getBalances());

            case 2:
              balances = _context8.sent;
              console.log("removeAssets ");
              AssetsToRemove = [];
              i = 0;

            case 6:
              if (!(i < balances.length)) {
                _context8.next = 22;
                break;
              }

              balance = balances[i];
              asset_type = balance.asset_type;

              if (!(asset_type != 'native')) {
                _context8.next = 19;
                break;
              }

              asset = balance.asset_code;
              issuer = balance.asset_issuer;
              sellAsset = execution.createAsset(asset, issuer);
              assetBalance = parseFloat(balance.balance);

              if (!(assetBalance < 5)) {
                _context8.next = 19;
                break;
              }

              console.log("removing asset,  ", sellAsset);
              _context8.next = 18;
              return regeneratorRuntime.awrap(trader.removeAsset(sellAsset));

            case 18:
              console.log("asset remoed , sleeping for 2 sec  ");

            case 19:
              i++;
              _context8.next = 6;
              break;

            case 22:
              return _context8.abrupt("return", true);

            case 23:
            case "end":
              return _context8.stop();
          }
        }
      });
    }
  }, {
    key: "sleep",
    value: function sleep(ms) {
      return regeneratorRuntime.async(function sleep$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", new Promise(function (resolve) {
                return setTimeout(resolve, ms);
              }));

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      });
    }
  }, {
    key: "sellAssetOnMarket",
    value: function sellAssetOnMarket() {
      var balances, i, balance, asset_type, asset, issuer, sellAsset, assetBalance;
      return regeneratorRuntime.async(function sellAssetOnMarket$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return regeneratorRuntime.awrap(execution.getBalances());

            case 2:
              balances = _context10.sent;
              console.log("BALANCES ", balances);
              i = 0;

            case 5:
              if (!(i < balances.length)) {
                _context10.next = 20;
                break;
              }

              balance = balances[i];
              asset_type = balance.asset_type;

              if (!(asset_type != 'native')) {
                _context10.next = 17;
                break;
              }

              asset = balance.asset_code;
              issuer = balance.asset_issuer;
              sellAsset = execution.createAsset(asset, issuer);
              assetBalance = parseFloat(balance.balance);

              if (!(assetBalance > 0)) {
                _context10.next = 17;
                break;
              }

              console.log("selling ", sellAsset);
              _context10.next = 17;
              return regeneratorRuntime.awrap(trader.sellAssetOnMarket(sellAsset));

            case 17:
              i++;
              _context10.next = 5;
              break;

            case 20:
            case "end":
              return _context10.stop();
          }
        }
      });
    }
  }, {
    key: "offersWorker",
    value: function offersWorker() {
      var orders;
      return regeneratorRuntime.async(function offersWorker$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return regeneratorRuntime.awrap(helper.getAllRunningOrders());

            case 2:
              orders = _context12.sent;
              console.log("Orders", orders);

              if (orders !== undefined) {
                orders.forEach(function _callee2(order_id) {
                  var orderInfo;
                  return regeneratorRuntime.async(function _callee2$(_context11) {
                    while (1) {
                      switch (_context11.prev = _context11.next) {
                        case 0:
                          _context11.next = 2;
                          return regeneratorRuntime.awrap(helper.retrieveOrderDetails(order_id));

                        case 2:
                          orderInfo = _context11.sent;

                          if (!(orderInfo != undefined)) {
                            _context11.next = 6;
                            break;
                          }

                          _context11.next = 6;
                          return regeneratorRuntime.awrap(trader.monitorBuyOrderAndPlaceSellOrder(orderInfo.asset, orderInfo.order_id, orderInfo.price));

                        case 6:
                        case "end":
                          return _context11.stop();
                      }
                    }
                  });
                });
              }

            case 5:
            case "end":
              return _context12.stop();
          }
        }
      });
    }
  }, {
    key: "updateBestAssets",
    value: function updateBestAssets() {
      var bestAssets;
      return regeneratorRuntime.async(function updateBestAssets$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.prev = 0;
              _context13.next = 3;
              return regeneratorRuntime.awrap(this.assets.getBestAssetsToTrade(5));

            case 3:
              bestAssets = _context13.sent;
              console.log("GOT THE BEST ASSETS", bestAssets);
              _context13.next = 7;
              return regeneratorRuntime.awrap(_redisClient["default"].set(_config.redis.bestAssetsKey, JSON.stringify(bestAssets)));

            case 7:
              _context13.next = 9;
              return regeneratorRuntime.awrap(_redisClient["default"].set(_config.redis.lastUpdatedKey, Date.now()));

            case 9:
              _context13.next = 14;
              break;

            case 11:
              _context13.prev = 11;
              _context13.t0 = _context13["catch"](0);
              console.log("updateAssetsError", _context13.t0);

            case 14:
            case "end":
              return _context13.stop();
          }
        }
      }, null, this, [[0, 11]]);
    }
  }, {
    key: "calculateXlmFromAsset",
    value: function calculateXlmFromAsset(sourceAsset, amount) {
      var _url, response, json, estimatedXlmAmount;

      return regeneratorRuntime.async(function calculateXlmFromAsset$(_context14) {
        while (1) {
          switch (_context14.prev = _context14.next) {
            case 0:
              _context14.prev = 0;
              // Construct the API endpoint URL
              _url = "https://horizon.stellar.org/paths/strict-send?destination_assets=native&source_asset_type=credit_alphanum4&source_asset_issuer=".concat(sourceAsset.issuer, "&source_asset_code=").concat(sourceAsset.code, "&source_amount=").concat(amount); // Fetch the response from the API

              _context14.next = 4;
              return regeneratorRuntime.awrap((0, _nodeFetch["default"])(_url));

            case 4:
              response = _context14.sent;
              _context14.next = 7;
              return regeneratorRuntime.awrap(response.json());

            case 7:
              json = _context14.sent;
              // Extract the estimated XLM amount from the response
              estimatedXlmAmount = parseFloat(json._embedded.records[0].destination_amount);
              console.log("estimatedXlmAmount", estimatedXlmAmount);
              return _context14.abrupt("return", estimatedXlmAmount);

            case 13:
              _context14.prev = 13;
              _context14.t0 = _context14["catch"](0);
              return _context14.abrupt("return", 0);

            case 16:
            case "end":
              return _context14.stop();
          }
        }
      }, null, null, [[0, 13]]);
    }
  }, {
    key: "getXlmEquivalent",
    value: function getXlmEquivalent() {
      var response, assets, xlmEquivalent, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, asset, _assetToSell, _xlmAmount, assetToSell, xlmAmount;

      return regeneratorRuntime.async(function getXlmEquivalent$(_context15) {
        while (1) {
          switch (_context15.prev = _context15.next) {
            case 0:
              _context15.next = 2;
              return regeneratorRuntime.awrap((0, _nodeFetch["default"])(url));

            case 2:
              response = _context15.sent;
              _context15.next = 5;
              return regeneratorRuntime.awrap(response.json());

            case 5:
              assets = _context15.sent;
              xlmEquivalent = {}; // Loop through the assets and calculate the XLM equivalent of 10,000 units of each asset

              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context15.prev = 10;
              _iterator = assets._embedded.records[Symbol.iterator]();

            case 12:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context15.next = 24;
                break;
              }

              asset = _step.value;
              console.log('Asset code:', asset.asset_code);
              console.log('Asset issuer:', asset.asset_issuer);
              _assetToSell = new _stellarSdk.Asset(asset.asset_code, asset.asset_issuer);
              _context15.next = 19;
              return regeneratorRuntime.awrap(this.calculateXlmFromAsset(_assetToSell, '10000'));

            case 19:
              _xlmAmount = _context15.sent;
              xlmEquivalent[asset.asset_code] = _xlmAmount;

            case 21:
              _iteratorNormalCompletion = true;
              _context15.next = 12;
              break;

            case 24:
              _context15.next = 30;
              break;

            case 26:
              _context15.prev = 26;
              _context15.t0 = _context15["catch"](10);
              _didIteratorError = true;
              _iteratorError = _context15.t0;

            case 30:
              _context15.prev = 30;
              _context15.prev = 31;

              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }

            case 33:
              _context15.prev = 33;

              if (!_didIteratorError) {
                _context15.next = 36;
                break;
              }

              throw _iteratorError;

            case 36:
              return _context15.finish(33);

            case 37:
              return _context15.finish(30);

            case 38:
              assetToSell = new _stellarSdk.Asset("CLIX", "GBCJSKXTZX5CYKJGBGQPYEATLSGR4EPRUOL7EKIDCDOZ4UC67BBQRCSO");
              _context15.next = 41;
              return regeneratorRuntime.awrap(calculateXlmFromAsset(assetToSell, '10000'));

            case 41:
              xlmAmount = _context15.sent;
              xlmEquivalent["CLIX"] = xlmAmount;
              return _context15.abrupt("return", xlmEquivalent);

            case 44:
            case "end":
              return _context15.stop();
          }
        }
      }, null, this, [[10, 26, 30, 38], [31,, 33, 37]]);
    }
  }, {
    key: "sendSMS",
    value: function sendSMS(message) {
      var phone, _url2, formData, response, result;

      return regeneratorRuntime.async(function sendSMS$(_context16) {
        while (1) {
          switch (_context16.prev = _context16.next) {
            case 0:
              _context16.prev = 0;
              phone = "256787719618";
              _url2 = 'https://clic.world/fedapi/v2/sms.php';
              formData = new URLSearchParams({
                phone: phone,
                message: message
              });
              _context16.next = 6;
              return regeneratorRuntime.awrap((0, _nodeFetch["default"])(_url2, {
                method: 'POST',
                body: formData
              }));

            case 6:
              response = _context16.sent;

              if (response.ok) {
                _context16.next = 9;
                break;
              }

              throw new Error('Failed to send SMS');

            case 9:
              _context16.next = 11;
              return regeneratorRuntime.awrap(response.text());

            case 11:
              result = _context16.sent;
              console.log(result); // the response from the server

              return _context16.abrupt("return", true);

            case 16:
              _context16.prev = 16;
              _context16.t0 = _context16["catch"](0);
              return _context16.abrupt("return", false);

            case 19:
            case "end":
              return _context16.stop();
          }
        }
      }, null, null, [[0, 16]]);
    }
  }, {
    key: "trackClicCoins",
    value: function trackClicCoins() {
      getXlmEquivalent().then(function (result) {
        console.log(result);

        for (var asset in result) {
          var amount = result[asset];

          if (amount > 499 || asset == "CLIX" && amount > 200) {
            var message = "Cli Asset Alert. Asset code: ".concat(asset, ", Amount: ").concat(result[asset]);
            sendSMS(message);
          }
        }
      })["catch"](function (error) {
        console.error(error);
      });
    }
  }]);

  return CronService;
}();

exports["default"] = CronService;