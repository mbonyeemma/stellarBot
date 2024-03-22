"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _base = _interopRequireDefault(require("./base.model"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var TradeHelper =
/*#__PURE__*/
function (_BaseModel) {
  _inherits(TradeHelper, _BaseModel);

  function TradeHelper() {
    _classCallCheck(this, TradeHelper);

    return _possibleConstructorReturn(this, _getPrototypeOf(TradeHelper).call(this, "identities"));
  }

  _createClass(TradeHelper, [{
    key: "removeAppSettingItem",
    value: function removeAppSettingItem(itemId) {
      var rs;
      return regeneratorRuntime.async(function removeAppSettingItem$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return regeneratorRuntime.awrap(this.callQuery("UPDATE user SET deleted_at IS NULL AND id = ".concat(itemId)));

            case 3:
              rs = _context.sent;
              return _context.abrupt("return", true);

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              console.log("Error", _context.t0);
              return _context.abrupt("return", false);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[0, 7]]);
    }
  }, {
    key: "GetOffer",
    value: function GetOffer(offerId) {
      var pairRes;
      return regeneratorRuntime.async(function GetOffer$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return regeneratorRuntime.awrap(this.callQuery("CALL GetOffer('".concat(offerId, "');")));

            case 3:
              pairRes = _context2.sent;
              return _context2.abrupt("return", pairRes);

            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2["catch"](0);
              return _context2.abrupt("return", false);

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[0, 7]]);
    }
  }, {
    key: "getSettings",
    value: function getSettings() {
      var pairRes;
      return regeneratorRuntime.async(function getSettings$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return regeneratorRuntime.awrap(this.callQuery("CALL getSettings();"));

            case 3:
              pairRes = _context3.sent;
              return _context3.abrupt("return", pairRes[0]);

            case 7:
              _context3.prev = 7;
              _context3.t0 = _context3["catch"](0);
              return _context3.abrupt("return", false);

            case 10:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this, [[0, 7]]);
    }
  }, {
    key: "GetAccounts",
    value: function GetAccounts(currency) {
      var pairRes;
      return regeneratorRuntime.async(function GetAccounts$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return regeneratorRuntime.awrap(this.callQuery("CALL spGetAccounts('".concat(currency, "');")));

            case 3:
              pairRes = _context4.sent;
              return _context4.abrupt("return", pairRes);

            case 7:
              _context4.prev = 7;
              _context4.t0 = _context4["catch"](0);
              return _context4.abrupt("return", false);

            case 10:
            case "end":
              return _context4.stop();
          }
        }
      }, null, this, [[0, 7]]);
    }
  }, {
    key: "GetAssets",
    value: function GetAssets(currency) {
      var pairRes;
      return regeneratorRuntime.async(function GetAssets$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return regeneratorRuntime.awrap(this.callQuery("CALL spGetAssets('".concat(currency, "');")));

            case 3:
              pairRes = _context5.sent;
              return _context5.abrupt("return", pairRes);

            case 7:
              _context5.prev = 7;
              _context5.t0 = _context5["catch"](0);
              return _context5.abrupt("return", false);

            case 10:
            case "end":
              return _context5.stop();
          }
        }
      }, null, this, [[0, 7]]);
    }
  }, {
    key: "getAdminSettings",
    value: function getAdminSettings() {
      return regeneratorRuntime.async(function getAdminSettings$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              this.callQuery("SELECT * FROM app_settings WHERE id=1").then(function (res) {
                return res;
              }, function (error) {
                console.log("Error", error);
                return false;
              });

            case 1:
            case "end":
              return _context6.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "GetAsset",
    value: function GetAsset(asset, issuer) {
      var pairRes;
      return regeneratorRuntime.async(function GetAsset$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.prev = 0;
              _context7.next = 3;
              return regeneratorRuntime.awrap(this.callQuery("CALL spGetAsset('".concat(asset, "', '").concat(issuer, "');")));

            case 3:
              pairRes = _context7.sent;
              return _context7.abrupt("return", pairRes);

            case 7:
              _context7.prev = 7;
              _context7.t0 = _context7["catch"](0);
              return _context7.abrupt("return", false);

            case 10:
            case "end":
              return _context7.stop();
          }
        }
      }, null, this, [[0, 7]]);
    }
  }, {
    key: "saveBalances",
    value: function saveBalances(asset, issuer, action) {
      var rs, inData;
      return regeneratorRuntime.async(function saveBalances$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.prev = 0;

              if (!(action === 'remove')) {
                _context8.next = 8;
                break;
              }

              _context8.next = 4;
              return regeneratorRuntime.awrap(this.callQuery("DELETE FROM trading_assets where asset_code = '".concat(asset, "' AND asset_issue = '").concat(issuer, "'")));

            case 4:
              rs = _context8.sent;
              return _context8.abrupt("return", true);

            case 8:
              inData = {
                asset_code: asset,
                asset_issue: issuer
              };
              _context8.next = 11;
              return regeneratorRuntime.awrap(this.inserData("trading_assets", inData));

            case 11:
              return _context8.abrupt("return", true);

            case 14:
              _context8.prev = 14;
              _context8.t0 = _context8["catch"](0);
              return _context8.abrupt("return", false);

            case 17:
            case "end":
              return _context8.stop();
          }
        }
      }, null, this, [[0, 14]]);
    }
  }, {
    key: "updateData",
    value: function updateData(table, data, updateWhere) {
      var _this = this;

      return regeneratorRuntime.async(function updateData$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              return _context10.abrupt("return", new Promise(function _callee(resolve) {
                var keys, values, i, key, value;
                return regeneratorRuntime.async(function _callee$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _this.tableName = table;
                        _this.updateWhere = updateWhere;
                        keys = Object.keys(data);
                        values = Object.values(data);
                        _this.insertion = "";

                        for (i = 0; i < keys.length; i++) {
                          key = keys[i];
                          value = values[i];

                          if (_this.insertion === "") {
                            _this.insertion += "".concat(key, "='").concat(value, "' ");
                          } else {
                            _this.insertion += ",".concat(key, "='").concat(value, "' ");
                          }
                        }

                        _this.updateRecords().then(function (res) {
                          return res;
                        }, function (error) {
                          console.log("QUOTE ERRO::", error);
                          return false;
                        });

                      case 7:
                      case "end":
                        return _context9.stop();
                    }
                  }
                });
              }));

            case 1:
            case "end":
              return _context10.stop();
          }
        }
      });
    }
  }, {
    key: "inserData",
    value: function inserData(table, data) {
      var _this2 = this;

      return regeneratorRuntime.async(function inserData$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              return _context12.abrupt("return", new Promise(function _callee2(resolve) {
                var keys, values, i, key, value;
                return regeneratorRuntime.async(function _callee2$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        _this2.tableName = table;
                        keys = Object.keys(data);
                        values = Object.values(data);
                        _this2.insertion = "";

                        for (i = 0; i < keys.length; i++) {
                          key = keys[i];
                          value = values[i];

                          if (_this2.insertion === "") {
                            _this2.insertion += "".concat(key, "='").concat(value, "' ");
                          } else {
                            _this2.insertion += ",".concat(key, "='").concat(value, "' ");
                          }
                        }

                        _this2.inserRecords().then(function (res) {
                          return res;
                        }, function (error) {
                          console.log("QUOTE ERRO::", error);
                          return false;
                        });

                      case 6:
                      case "end":
                        return _context11.stop();
                    }
                  }
                });
              }));

            case 1:
            case "end":
              return _context12.stop();
          }
        }
      });
    }
  }]);

  return TradeHelper;
}(_base["default"]);

var _default = new TradeHelper();

exports["default"] = _default;