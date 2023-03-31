"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _stellarSdk = _interopRequireDefault(require("stellar-sdk"));

var _config = require("./config");

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_dotenv["default"].config();

var server = new _stellarSdk["default"].Server(_config.config.horizonServer);

var sourceKeys = _stellarSdk["default"].Keypair.fromSecret(_config.config.secretKey);

var Execution =
/*#__PURE__*/
function () {
  function Execution() {
    _classCallCheck(this, Execution);
  }

  _createClass(Execution, [{
    key: "placeBuyOrder",
    value: function placeBuyOrder(assetToBuy, amount, price) {
      var offerId,
          _args = arguments;
      return regeneratorRuntime.async(function placeBuyOrder$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              offerId = _args.length > 3 && _args[3] !== undefined ? _args[3] : 0;
              return _context.abrupt("return", this.manageBuyOffer(assetToBuy, amount, price, offerId));

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "updateBuyOrder",
    value: function updateBuyOrder(assetToBuy, amount, price, offerId) {
      return regeneratorRuntime.async(function updateBuyOrder$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", this.manageBuyOffer(assetToBuy, amount, price, offerId));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "deleteBuyOrder",
    value: function deleteBuyOrder(offerId) {
      return regeneratorRuntime.async(function deleteBuyOrder$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", this.manageBuyOffer(null, 0, 1, offerId));

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "deleteAllSellOffersForAsset",
    value: function deleteAllSellOffersForAsset(asset) {
      var keypair, publicKey, account, offers, sellOffersToDelete, _ref, _ref2, fee, transactionBuilder, transaction, transactionResult;

      return regeneratorRuntime.async(function deleteAllSellOffersForAsset$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              keypair = _stellarSdk["default"].Keypair.fromSecret(_config.config.secretKey);
              publicKey = keypair.publicKey();
              _context4.next = 5;
              return regeneratorRuntime.awrap(server.loadAccount(publicKey));

            case 5:
              account = _context4.sent;
              _context4.next = 8;
              return regeneratorRuntime.awrap(server.offers().forAccount(publicKey).call());

            case 8:
              offers = _context4.sent;
              sellOffersToDelete = offers.records.filter(function (offer) {
                return offer.selling.asset_code === asset.code && offer.selling.asset_issuer === asset.issuer;
              });

              if (!(sellOffersToDelete.length === 0)) {
                _context4.next = 13;
                break;
              }

              console.log("No sell offers found for the asset.");
              return _context4.abrupt("return", true);

            case 13:
              _context4.next = 15;
              return regeneratorRuntime.awrap(Promise.all([server.feeStats()]));

            case 15:
              _ref = _context4.sent;
              _ref2 = _slicedToArray(_ref, 1);
              fee = _ref2[0].max_fee.mode;
              transactionBuilder = new _stellarSdk["default"].TransactionBuilder(account, {
                fee: fee,
                networkPassphrase: _stellarSdk["default"].Networks.PUBLIC
              });
              sellOffersToDelete.forEach(function (offer) {
                var buyAssetType = offer.buying.asset_type;
                var buyAsset;

                if (buyAssetType == 'native') {
                  buyAsset = _stellarSdk["default"].Asset["native"]();
                } else {
                  buyAsset = new _stellarSdk["default"].Asset(offer.buying.asset_code, offer.buying.asset_issuer);
                }

                console.log("offerObject", offer);
                var offerObject = {
                  selling: asset,
                  buying: buyAsset,
                  amount: "0",
                  price: offer.price,
                  offerId: offer.id
                };
                console.log("offerObject", offerObject);

                var manageSellOfferOp = _stellarSdk["default"].Operation.manageSellOffer(offerObject);

                transactionBuilder.addOperation(manageSellOfferOp);
              });
              transaction = transactionBuilder.setTimeout(100).build();
              transaction.sign(keypair);
              _context4.next = 24;
              return regeneratorRuntime.awrap(server.submitTransaction(transaction));

            case 24:
              transactionResult = _context4.sent;
              console.log(transactionResult);
              return _context4.abrupt("return", true);

            case 29:
              _context4.prev = 29;
              _context4.t0 = _context4["catch"](0);
              console.error("Error deleting sell offers for asset:", _context4.t0);
              return _context4.abrupt("return", false);

            case 33:
            case "end":
              return _context4.stop();
          }
        }
      }, null, null, [[0, 29]]);
    }
  }, {
    key: "getBalances",
    value: function getBalances() {
      var publicKey, account;
      return regeneratorRuntime.async(function getBalances$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              publicKey = _stellarSdk["default"].Keypair.fromSecret(_config.config.secretKey).publicKey();
              _context5.next = 3;
              return regeneratorRuntime.awrap(server.loadAccount(publicKey));

            case 3:
              account = _context5.sent;
              return _context5.abrupt("return", account.balances);

            case 5:
            case "end":
              return _context5.stop();
          }
        }
      });
    }
  }, {
    key: "getAvailableAssetAmount",
    value: function getAvailableAssetAmount(asset) {
      var publicKey, account, offers, assetBalance, assetSellAmount, availableAssetAmount;
      return regeneratorRuntime.async(function getAvailableAssetAmount$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.prev = 0;
              publicKey = _stellarSdk["default"].Keypair.fromSecret(_config.config.secretKey).publicKey();
              _context6.next = 4;
              return regeneratorRuntime.awrap(server.loadAccount(publicKey));

            case 4:
              account = _context6.sent;
              _context6.next = 7;
              return regeneratorRuntime.awrap(server.offers().forAccount(publicKey).call());

            case 7:
              offers = _context6.sent;
              assetBalance = 0;
              assetSellAmount = 0; // Find the asset balance

              account.balances.forEach(function (balance) {
                if (balance.asset_code === asset.code && balance.asset_issuer === asset.issuer) {
                  assetBalance = parseFloat(balance.balance);
                }
              }); // Calculate the amount of the asset in active sell offers

              offers.records.forEach(function (offer) {
                if (offer.selling.asset_code === asset.code && offer.selling.asset_issuer === asset.issuer) {
                  assetSellAmount += parseFloat(offer.amount);
                }
              }); // Calculate the amount of the asset not under a sell offer

              availableAssetAmount = assetBalance - assetSellAmount;
              return _context6.abrupt("return", availableAssetAmount);

            case 16:
              _context6.prev = 16;
              _context6.t0 = _context6["catch"](0);
              console.error("Error getting available asset amount:", _context6.t0);
              return _context6.abrupt("return", false);

            case 20:
            case "end":
              return _context6.stop();
          }
        }
      }, null, null, [[0, 16]]);
    }
  }, {
    key: "manageBuyOffer",
    value: function manageBuyOffer(assetToBuy, amount, price, offerId) {
      var senderKeypair, buyingAsset, data, _ref3, _ref4, fee, sender, manageBuyOfferOp, transaction, transactionResult;

      return regeneratorRuntime.async(function manageBuyOffer$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              senderKeypair = _stellarSdk["default"].Keypair.fromSecret(_config.config.secretKey);

              if (assetToBuy) {
                buyingAsset = new _stellarSdk["default"].Asset(assetToBuy.code, assetToBuy.issuer);
              }

              data = {
                selling: this.createAsset(_config.config.quoteAsset),
                buying: buyingAsset,
                buyAmount: amount.toString(),
                price: price.toString(),
                offerId: offerId.toString()
              };
              console.log(data);
              _context7.next = 7;
              return regeneratorRuntime.awrap(Promise.all([server.feeStats(), server.loadAccount(senderKeypair.publicKey())]));

            case 7:
              _ref3 = _context7.sent;
              _ref4 = _slicedToArray(_ref3, 2);
              fee = _ref4[0].max_fee.mode;
              sender = _ref4[1];
              manageBuyOfferOp = _stellarSdk["default"].Operation.manageBuyOffer(data);
              transaction = new _stellarSdk["default"].TransactionBuilder(sender, {
                fee: fee,
                networkPassphrase: _stellarSdk["default"].Networks.PUBLIC
              }).addOperation(manageBuyOfferOp).setTimeout(100).build();
              transaction.sign(senderKeypair);
              _context7.prev = 14;
              _context7.next = 17;
              return regeneratorRuntime.awrap(server.submitTransaction(transaction));

            case 17:
              transactionResult = _context7.sent;
              return _context7.abrupt("return", transactionResult.hash);

            case 21:
              _context7.prev = 21;
              _context7.t0 = _context7["catch"](14);
              console.error("Oh no! Something went wrong.");
              console.error(_context7.t0);
              return _context7.abrupt("return", false);

            case 26:
              _context7.next = 32;
              break;

            case 28:
              _context7.prev = 28;
              _context7.t1 = _context7["catch"](0);
              console.error('Error managing buy offer:', _context7.t1);
              return _context7.abrupt("return", false);

            case 32:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[0, 28], [14, 21]]);
    }
  }, {
    key: "placeSellOrder",
    value: function placeSellOrder(assetToSell, amount, price) {
      var offerId,
          senderKeypair,
          sellingAsset,
          data,
          _ref5,
          _ref6,
          fee,
          sender,
          manageSellOfferOp,
          transaction,
          transactionResult,
          operationResult,
          manageSellOfferResult,
          orderId,
          _args8 = arguments;

      return regeneratorRuntime.async(function placeSellOrder$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              offerId = _args8.length > 3 && _args8[3] !== undefined ? _args8[3] : 0;
              console.log("placeSellOrder", assetToSell);
              _context8.prev = 2;
              senderKeypair = _stellarSdk["default"].Keypair.fromSecret(_config.config.secretKey);
              sellingAsset = new _stellarSdk["default"].Asset(assetToSell.code, assetToSell.issuer);
              data = {
                selling: sellingAsset,
                buying: this.createAsset(_config.config.quoteAsset),
                // Your quote asset (e.g., USD)
                amount: amount.toString(),
                price: price.toString(),
                offerId: offerId.toString() // Set to 0 to create a new offer

              };
              console.log("sellArray", data);
              _context8.next = 9;
              return regeneratorRuntime.awrap(Promise.all([server.feeStats(), server.loadAccount(senderKeypair.publicKey())]));

            case 9:
              _ref5 = _context8.sent;
              _ref6 = _slicedToArray(_ref5, 2);
              fee = _ref6[0].max_fee.mode;
              sender = _ref6[1];
              manageSellOfferOp = _stellarSdk["default"].Operation.manageSellOffer(data);
              transaction = new _stellarSdk["default"].TransactionBuilder(sender, {
                fee: fee,
                networkPassphrase: _stellarSdk["default"].Networks.PUBLIC
              }).addOperation(manageSellOfferOp).setTimeout(100).build();
              transaction.sign(senderKeypair);
              _context8.prev = 16;
              _context8.next = 19;
              return regeneratorRuntime.awrap(server.submitTransaction(transaction));

            case 19:
              transactionResult = _context8.sent;
              console.log(transactionResult);
              operationResult = transactionResult.extras.result_codes.operations[0];

              if (!(operationResult === "op_success")) {
                _context8.next = 29;
                break;
              }

              manageSellOfferResult = transactionResult.result_xdr ? _stellarSdk["default"].xdr.TransactionResult.fromXDR(transactionResult.result_xdr, "base64").result().results()[0].value() : null;
              orderId = manageSellOfferResult.offerId().toString();
              console.log("Order ID:", orderId);
              return _context8.abrupt("return", orderId);

            case 29:
              console.error("Operation failed:", operationResult);
              console.error("Operations:", transactionResult.extras.result_codes.operations);
              return _context8.abrupt("return", false);

            case 32:
              _context8.next = 40;
              break;

            case 34:
              _context8.prev = 34;
              _context8.t0 = _context8["catch"](16);
              console.error("Oh no! Something went wrong.");
              console.error("Error managing sell offer:", _context8.t0.response.data);
              console.error("Operations:", _context8.t0.response.data.extras.result_codes.operations);
              return _context8.abrupt("return", false);

            case 40:
              _context8.next = 46;
              break;

            case 42:
              _context8.prev = 42;
              _context8.t1 = _context8["catch"](2);
              console.error("Error managing sell offer:", _context8.t1);
              return _context8.abrupt("return", false);

            case 46:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this, [[2, 42], [16, 34]]);
    }
  }, {
    key: "createAsset",
    value: function createAsset(assetCode) {
      var issuerPublicKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      if (assetCode === 'XLM') {
        return _stellarSdk["default"].Asset["native"]();
      } else {
        return new _stellarSdk["default"].Asset(assetCode, issuerPublicKey);
      }
    }
  }, {
    key: "getAssetPrice",
    value: function getAssetPrice(assetToBuy) {
      var asset, orderbook, price;
      return regeneratorRuntime.async(function getAssetPrice$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.prev = 0;
              asset = new _stellarSdk["default"].Asset(assetToBuy.code, assetToBuy.issuer);
              _context9.next = 4;
              return regeneratorRuntime.awrap(server.orderbook(asset, this.createAsset(_config.config.quoteAsset)).call());

            case 4:
              orderbook = _context9.sent;

              if (!(orderbook.asks.length === 0)) {
                _context9.next = 7;
                break;
              }

              throw new Error('No asks found in the order book.');

            case 7:
              price = parseFloat(orderbook.asks[0].price);
              return _context9.abrupt("return", price);

            case 11:
              _context9.prev = 11;
              _context9.t0 = _context9["catch"](0);
              console.error('Error fetching asset price:', _context9.t0);
              return _context9.abrupt("return", null);

            case 15:
            case "end":
              return _context9.stop();
          }
        }
      }, null, this, [[0, 11]]);
    }
  }, {
    key: "getAssetBalance",
    value: function getAssetBalance(asset) {
      var sourceAccount, balance, assetBalance;
      return regeneratorRuntime.async(function getAssetBalance$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.prev = 0;
              _context10.next = 3;
              return regeneratorRuntime.awrap(server.loadAccount(sourceKeys.publicKey()));

            case 3:
              sourceAccount = _context10.sent;

              if (!(asset.code === 'XLM')) {
                _context10.next = 8;
                break;
              }

              balance = parseFloat(sourceAccount.balances.find(function (balance) {
                return balance.asset_type === 'native';
              }).balance);
              _context10.next = 12;
              break;

            case 8:
              assetBalance = sourceAccount.balances.find(function (balance) {
                return balance.asset_code === asset.code && balance.asset_issuer === asset.issuer;
              });

              if (assetBalance) {
                _context10.next = 11;
                break;
              }

              throw new Error('Asset not found in the account.');

            case 11:
              balance = parseFloat(assetBalance.balance);

            case 12:
              return _context10.abrupt("return", balance);

            case 15:
              _context10.prev = 15;
              _context10.t0 = _context10["catch"](0);
              console.error('Error fetching asset balance:', _context10.t0);
              return _context10.abrupt("return", null);

            case 19:
            case "end":
              return _context10.stop();
          }
        }
      }, null, null, [[0, 15]]);
    }
  }]);

  return Execution;
}();

exports["default"] = Execution;