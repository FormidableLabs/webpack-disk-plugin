"use strict";

var path = require("path");

var fs = require("fs-extra");
var async = require("async");

/**
 * Disk writing plugin.
 *
 * This plugin hooks into the `after-emit` lifecycle event to make sure that
 * all assets that _can_ be added to the compiler are. Then it takes an array
 * of objects mapping an object to an outputted file path.
 *
 * Pairs can be strings or regular expressions. E.g.,
 *
 * ```
 * output: {
 *   path: "build"
 * }
 * files: [
 *   {
 *     asset: /[a-f0-9]{20}\.main\.js/
 *   }, // => `build/7c2e208df031b936caff.main.js`
 *   {
 *     asset: /[a-f0-9]{20}\.main\.js/
 *     output: { path "build" }
 *   }, // => `build/7c2e208df031b936caff.main.js` (SAME)
 *   {
 *     asset: "stats.json",
 *     output: { path ".", filename: "stats.json" }
 *   }, // => `./stats.json`
 *   {
 *     asset: "stats.json",
 *     output: { path ".", filename: function (name) { return name; } }
 *   }, // => `./stats.json`
 * ]
 * ```
 *
 * @param {Object}        opts              options
 * @param {Array|Object}  opts.files        List of `assetName: filePath` pairs or single pair.
 * @param {Array|Object}  opts.output       Output object.
 * @param {Array|Object}  opts.output.path  Directory path to place assets.
 * @returns {void}
 *
 * @api public
 */
function DiskPlugin(opts) { // eslint-disable-line func-style
  this.opts = Object.create(opts || {});
  this.opts.files = this.opts.files || [];
  this.opts.output = this.opts.output || {};
  this.opts.output.path = this.opts.output.path || ".";
}

DiskPlugin.prototype = {
  constructor: DiskPlugin,

  // Iterate assets to create mapping of compiler source -> file path.
  _mapAssets: function (assets) {
    var basePath = this.opts.output.path;
    var files = this.opts.files;
    files = Array.isArray(files) ? files : [files];

    return Object.keys(assets)
      // Map to single output file.
      .map(function (asset) {
        // Create list of potential outputs.
        return files
          // Limit to string|regex matches.
          .filter(function (file) {
            var assetMatch = file.asset;
            return typeof assetMatch === "string" ? assetMatch === asset : assetMatch.test(asset);
          })
          // Convert to mapped pairs.
          .map(function (file) {
            var output = file.output || {};

            // Resolve path from base and current.
            var filePath = typeof output.path === "undefined" ? basePath : output.path;

            // Resolve filepath.
            var fileName = output.filename || asset;
            if (typeof fileName === "function") {
              fileName = fileName(asset);
            }

            return { asset: asset, output: path.resolve(filePath, fileName) };
          });
      })
      // Remove empties.
      .filter(function (pair) { return pair.length; })
      // Flatten.
      .reduce(function (memo, pair) {
        return memo.concat(pair);
      }, []);
  },

  apply: function (compiler) {
    var mapAssets = this._mapAssets.bind(this);

    compiler.plugin("after-emit", function (curCompiler, callback) {
      // Iterate assets to create mapping of compiler source -> file path.
      var assets = curCompiler.assets;
      var assetMap = mapAssets(assets);

      // Check that all output paths are unique.
      var uniqOutputs = assetMap
        .map(function (pair) { return pair.output; })
        .filter(function (output, idx, arr) { return arr.indexOf(output) === idx; });
      if (assetMap.length !== uniqOutputs.length) {
        return void callback(
          new Error("Found 2+ files outputting to same path: " + JSON.stringify(assetMap)));
      }

      // Write all files while guaranteeing intermediate directory paths.
      async.each(assetMap, function (pair, cb) {
        async.series([
          fs.ensureFile.bind(fs, pair.output),
          fs.writeFile.bind(fs, pair.output, assets[pair.asset].source())
        ], cb);
      }, callback);
    });
  }
};

module.exports = DiskPlugin;
