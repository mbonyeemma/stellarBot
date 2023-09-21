"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _mysql = require("mysql");

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

_dotenv["default"].config();

var DbHelper =
/*#__PURE__*/
function () {
  function DbHelper() {
    _classCallCheck(this, DbHelper);

    this.normalPool = this.initializePool('normal');
  }

  _createClass(DbHelper, [{
    key: "initializePool",
    value: function initializePool(connectionType) {
      var db = {
        connectionLimit: 1,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PWD
      };
      console.log(db);
      return (0, _mysql.createPool)(db);
    }
  }, {
    key: "pdo",
    value: function pdo(query) {
      var conType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'normal';

      try {
        console.log("query", query);

        if (query == undefined || query == null || query == '') {
          return false;
        }

        var pdoConnect;
        pdoConnect = this.normalPool;
        return new Promise(function (resolve, reject) {
          pdoConnect.getConnection(function (err, connection) {
            if (err) {
              // console.log(err);
              return reject(err);
            }

            connection.query(query, function (error, results) {
              connection.release();
              if (error) return reject(error);
              var result = results.length > 0 ? JSON.parse(JSON.stringify(results[0])) : [];
              resolve(result);
            });
          });
        });
      } catch (err) {//  console.log(err)
      }
    }
  }, {
    key: "readOpreation",
    value: function readOpreation() {
      this.readPool = this.initializePool('read');
    }
  }, {
    key: "writeOpreation",
    value: function writeOpreation() {
      this.writePool = this.initializePool('read');
    }
  }]);

  return DbHelper;
}();

var _default = DbHelper;
exports["default"] = _default;