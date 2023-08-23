"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _db = _interopRequireDefault(require("./db.helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var dbs = new _db["default"]();

var BaseModel =
/*#__PURE__*/
function () {
  function BaseModel(value) {
    _classCallCheck(this, BaseModel);

    this.tableName = value;
    this.insertion = undefined;
    this.selectCols = undefined;
    this.selectWhere = '';
    this.offsets = 0;
    this.limits = 10;
    this.orderBy = '';
    this.orderIs = '';
    this.updation = undefined;
    this.fileId = undefined;
    this.updateWhere = '';
    this.insertPrimaryKey = undefined;
  }

  _createClass(BaseModel, [{
    key: "inserRecords",
    value: function inserRecords() {
      var query = 'CALL InsertData("' + this.tableName + '","' + this.insertion + '");';
      return dbs.pdo(query, "write");
    }
  }, {
    key: "getRecords",
    value: function getRecords() {
      var query = 'CALL getFile("' + this.fileId + '");';
      return dbs.pdo(query);
    }
  }, {
    key: "deleteDocsBeforeUpload",
    value: function deleteDocsBeforeUpload(kycId) {
      var _this = this;

      return new Promise(function (resolve) {
        _this.callQuery("call deleteDocsBeforeInsert('".concat(kycId, "');")).then(function (res) {
          return resolve(res);
        }, function () {
          return resolve(false);
        });
      });
    }
  }, {
    key: "deleteRecord",
    value: function deleteRecord() {
      var isSelfie = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var userId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var query;

      if (isSelfie) {
        query = "CALL deleteSelfie('".concat(this.fileId, "','").concat(userId, "')");
        var result = dbs.pdo(query);
        this.fileId = '';
        return result;
      } else {
        query = 'CALL deleteFile("' + this.fileId + '");';

        var _result = dbs.pdo(query);

        this.fileId = '';
        return _result;
      }
    }
  }, {
    key: "selectRecords",
    value: function selectRecords() {
      var query, result;
      return regeneratorRuntime.async(function selectRecords$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              query = 'call SelectData("' + this.selectCols + '","' + this.tableName + '","' + this.selectWhere + '",' + this.offsets + ',' + this.limits + ',"' + this.orderBy + '","' + this.orderIs + '");';
              _context.next = 3;
              return regeneratorRuntime.awrap(dbs.pdo(query));

            case 3:
              result = _context.sent;
              this.resetSelectSettings();
              return _context.abrupt("return", result);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "updateRecords",
    value: function updateRecords() {
      var query;
      return regeneratorRuntime.async(function updateRecords$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              query = 'call updateData("' + this.tableName + '","' + this.updation + '","' + this.updateWhere + '");';
              _context2.next = 3;
              return regeneratorRuntime.awrap(dbs.pdo(query));

            case 3:
              return _context2.abrupt("return", _context2.sent);

            case 4:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "callQuery",
    value: function callQuery(query) {
      var connType,
          result,
          _args3 = arguments;
      return regeneratorRuntime.async(function callQuery$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              connType = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 'normal';
              _context3.next = 3;
              return regeneratorRuntime.awrap(dbs.pdo(query, connType));

            case 3:
              result = _context3.sent;
              console.log("chatResult", result);
              this.resetSelectSettings();
              return _context3.abrupt("return", result);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "resetSelectSettings",
    value: function resetSelectSettings() {
      this.selectWhere = '';
      this.orderBy = '';
      this.orderIs = '';
      this.selectCols = '';
      this.offsets = 0;
    }
  }]);

  return BaseModel;
}();

var _default = BaseModel;
exports["default"] = _default;