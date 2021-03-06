"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLocation = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _get = _interopRequireDefault(require("lodash/get"));

var _isNil = _interopRequireDefault(require("lodash/isNil"));

var _stream = require("stream");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GetLocation extends _stream.Transform {
  constructor(options) {
    super({ ...options,
      objectMode: true
    }); // This is a dumb cache which could result in a memory leak if too many locations exist.
    // It could either be improved to remove unused locations after the cache gets too large
    // or implement a better solution such as Redis

    this.cache = {};
  }

  async getHomeworld(individual) {
    const {
      homeworld
    } = individual;

    if (this.cache[homeworld]) {
      return this.cache[homeworld];
    }

    const response = await (0, _axios.default)({
      method: "get",
      responseType: "json",
      url: homeworld
    });
    this.cache[homeworld] = (0, _get.default)(response, "data.name");
    return this.cache[homeworld];
  }

  async _transform(individual, encoding, callback) {
    try {
      if ((0, _isNil.default)((0, _get.default)(individual, "homeworld"))) {
        return callback();
      }

      const withHomeworld = { ...individual,
        homeworld: await this.getHomeworld(individual)
      };
      callback(null, withHomeworld);
    } catch (err) {
      console.log(err);
      callback(err);
    }
  }

}

const getLocation = new GetLocation();
exports.getLocation = getLocation;