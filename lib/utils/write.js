var fs = require('fs');
var path = require('path');
var log = require('./log');
/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

module.exports = function write(target, str) {
  fs.writeFile(target, str);
  log('create', path.basename(target));
};
