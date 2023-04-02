"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _stellarSdk = _interopRequireWildcard(require("stellar-sdk"));

var _config = require("./config");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var horizonServer = _config.config.horizonServer,
    baseAsset = _config.config.baseAsset;
var _quoteAsset = baseAsset;
var server = new _stellarSdk["default"].Server("https://horizon.stellar.org");

var AssetLookup =
/*#__PURE__*/
function () {
  function AssetLookup(server) {
    _classCallCheck(this, AssetLookup);

    this.server = server;
  }

  _createClass(AssetLookup, [{
    key: "getBestAssetsToTrade",
    value: function getBestAssetsToTrade() {
      var _this = this;

      var numAssets,
          assets,
          assetMetrics,
          _args2 = arguments;
      return regeneratorRuntime.async(function getBestAssetsToTrade$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              numAssets = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 5;
              _context2.prev = 1;
              console.log("getBestAssetsToTrade", numAssets);
              _context2.next = 5;
              return regeneratorRuntime.awrap(this.fetchAllAssets());

            case 5:
              assets = _context2.sent;
              _context2.next = 8;
              return regeneratorRuntime.awrap(Promise.all(assets.map(function _callee(asset) {
                var metrics;
                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return regeneratorRuntime.awrap(_this.calculateAssetMetrics(asset));

                      case 2:
                        metrics = _context.sent;
                        return _context.abrupt("return", _objectSpread({
                          asset: asset
                        }, metrics));

                      case 4:
                      case "end":
                        return _context.stop();
                    }
                  }
                });
              })));

            case 8:
              assetMetrics = _context2.sent;
              assetMetrics.sort(function (a, b) {
                var volumeDiff = b.volume - a.volume;
                var volatilityDiff = b.volatility - a.volatility;
                var marginDiff = b.margin - a.margin;
                var volumeWeight = 0.2;
                var volatilityWeight = 0.8;
                var marginWeight = 0.1;
                return volumeWeight * volumeDiff + volatilityWeight * volatilityDiff + marginWeight * marginDiff;
              });
              return _context2.abrupt("return", assetMetrics.slice(0, numAssets).map(function (metric) {
                return metric.asset;
              }));

            case 13:
              _context2.prev = 13;
              _context2.t0 = _context2["catch"](1);
              console.error('Error fetching best assets to trade:', _context2.t0);
              return _context2.abrupt("return", []);

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[1, 13]]);
    }
  }, {
    key: "fetchAllAssets",
    value: function fetchAllAssets() {
      var activeAssets;
      return regeneratorRuntime.async(function fetchAllAssets$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(this.getAssetsWithVolume());

            case 2:
              activeAssets = _context3.sent;
              console.log("activeAssets", activeAssets);
              return _context3.abrupt("return", activeAssets);

            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "getAssetsWithVolume",
    value: function getAssetsWithVolume() {
      var url, response, assets, activeAssets;
      return regeneratorRuntime.async(function getAssetsWithVolume$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              url = 'https://api.stellarterm.com/v1/ticker.json';
              _context4.next = 3;
              return regeneratorRuntime.awrap(_axios["default"].get(url));

            case 3:
              response = _context4.sent;

              if (!(response.data && response.data.assets)) {
                _context4.next = 10;
                break;
              }

              assets = response.data.assets;
              activeAssets = assets.filter(function (asset) {
                return asset.price_USD < 1 && asset.activityScore > 10 && asset.activityScore < 20 && asset.volume24h_XLM < 200000;
              });
              return _context4.abrupt("return", activeAssets);

            case 10:
              throw new Error('Failed to fetch assets from StellarTerm API');

            case 11:
            case "end":
              return _context4.stop();
          }
        }
      });
    }
  }, {
    key: "createAsset",
    value: function createAsset(assetCode, issuerPublicKey) {
      if (assetCode === 'XLM') {
        return _stellarSdk["default"].Asset["native"]();
      } else {
        return new _stellarSdk["default"].Asset(assetCode, issuerPublicKey);
      }
    }
  }, {
    key: "calculateAssetMetrics",
    value: function calculateAssetMetrics(asset) {
      var quoteAsset, baseAsset, volume, priceHistory, volatility, margin;
      return regeneratorRuntime.async(function calculateAssetMetrics$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              quoteAsset = this.createAsset(asset.code, asset.issuer);
              baseAsset = this.createAsset("XLM", ""); // Fetch trading volume

              _context5.next = 4;
              return regeneratorRuntime.awrap(this.fetchTradingVolume(baseAsset, quoteAsset));

            case 4:
              volume = _context5.sent;
              _context5.next = 7;
              return regeneratorRuntime.awrap(this.fetchPriceHistory(baseAsset, quoteAsset));

            case 7:
              priceHistory = _context5.sent;
              volatility = this.calculateVolatility(priceHistory); // Calculate buy-sell margin

              _context5.next = 11;
              return regeneratorRuntime.awrap(this.calculateBuySellMargin(baseAsset, quoteAsset));

            case 11:
              margin = _context5.sent;
              console.log("HERE last item", {
                volume: volume,
                volatility: volatility,
                margin: margin
              });
              return _context5.abrupt("return", {
                volume: volume,
                volatility: volatility,
                margin: margin
              });

            case 14:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "fetchTradingVolume",
    value: function fetchTradingVolume(baseAsset, quoteAsset) {
      var startTime, endTime, resolution, offset, totalVolume, trRsp;
      return regeneratorRuntime.async(function fetchTradingVolume$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              startTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

              endTime = Date.now();
              resolution = 3600000;
              console.log("fetchTradingVolume", quoteAsset.code);
              offset = 0;
              totalVolume = 0;
              _context6.prev = 6;
              _context6.next = 9;
              return regeneratorRuntime.awrap(server.tradeAggregation(baseAsset, quoteAsset, startTime, endTime, resolution, offset).call());

            case 9:
              trRsp = _context6.sent;
              trRsp.records.forEach(function (record) {
                totalVolume += parseFloat(record.base_volume);
              });
              _context6.next = 16;
              break;

            case 13:
              _context6.prev = 13;
              _context6.t0 = _context6["catch"](6);
              console.log(_context6.t0);

            case 16:
              return _context6.abrupt("return", totalVolume);

            case 17:
            case "end":
              return _context6.stop();
          }
        }
      }, null, null, [[6, 13]]);
    }
  }, {
    key: "fetchPriceHistory",
    value: function fetchPriceHistory(baseAsset, quoteAsset) {
      var startTime, endTime, resolution, offset, tradeAggregation, priceHistory;
      return regeneratorRuntime.async(function fetchPriceHistory$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              startTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

              endTime = Date.now();
              resolution = 24 * 60 * 60 * 1000; // 1-day resolution

              offset = 0;
              _context7.prev = 4;
              _context7.next = 7;
              return regeneratorRuntime.awrap(server.tradeAggregation(baseAsset, quoteAsset, startTime, endTime, resolution, offset).call());

            case 7:
              tradeAggregation = _context7.sent;
              priceHistory = tradeAggregation.records.map(function (record) {
                return parseFloat(record.close);
              });
              return _context7.abrupt("return", priceHistory);

            case 12:
              _context7.prev = 12;
              _context7.t0 = _context7["catch"](4);
              console.log("ERROR", _context7.t0);
              return _context7.abrupt("return", []);

            case 16:
            case "end":
              return _context7.stop();
          }
        }
      }, null, null, [[4, 12]]);
    }
  }, {
    key: "calculateVolatility",
    value: function calculateVolatility(priceHistory) {
      if (priceHistory.length < 2) {
        return 0;
      }

      var sum = 0;
      var sumOfSquares = 0;

      for (var i = 1; i < priceHistory.length; i++) {
        var dailyReturn = (priceHistory[i] - priceHistory[i - 1]) / priceHistory[i - 1];
        sum += dailyReturn;
        sumOfSquares += dailyReturn * dailyReturn;
      }

      var mean = sum / (priceHistory.length - 1);
      var variance = sumOfSquares / (priceHistory.length - 1) - mean * mean;
      return Math.sqrt(variance);
    }
  }, {
    key: "calculateBuySellMargin",
    value: function calculateBuySellMargin(baseAsset, quoteAsset) {
      var orderbook, bestBidPrice, bestAskPrice, margin;
      return regeneratorRuntime.async(function calculateBuySellMargin$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return regeneratorRuntime.awrap(server.orderbook(baseAsset, quoteAsset).call());

            case 2:
              orderbook = _context8.sent;

              if (!(orderbook.bids.length === 0 || orderbook.asks.length === 0)) {
                _context8.next = 5;
                break;
              }

              return _context8.abrupt("return", 0);

            case 5:
              // Get the best bid and ask prices
              bestBidPrice = parseFloat(orderbook.bids[0].price);
              bestAskPrice = parseFloat(orderbook.asks[0].price); // Calculate the margin as a percentage

              margin = (bestAskPrice - bestBidPrice) / bestBidPrice;
              return _context8.abrupt("return", margin);

            case 9:
            case "end":
              return _context8.stop();
          }
        }
      });
    }
  }]);

  return AssetLookup;
}();

exports["default"] = AssetLookup;