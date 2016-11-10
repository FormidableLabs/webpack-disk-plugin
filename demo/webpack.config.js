"use strict";

/**
 * Webpack configuration
 */
var path = require("path");
var StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
var DiskPlugin = require("../lib/index");

module.exports = {
  cache: true,
  context: __dirname,
  entry: "./main.js",
  output: {
    path: path.join(__dirname, "build"),
    publicPath: "/assets/",
    filename: "deadbeef012345678901.main.js" // Simulate a hash for determinacy.
  },
  plugins: [
    // Outputs `stats.json`
    new StatsWriterPlugin(),

    // Various disk plugin scenarios...
    // Noops.
    new DiskPlugin(),
    new DiskPlugin({}),
    new DiskPlugin({
      output: { path: "build-0" }
    }),

    // Basic scenarios.
    new DiskPlugin({ // build-1/
      output: { path: "build-1" },
      files: [
        { asset: "stats.json" }
      ]
    }),
    new DiskPlugin({ // build-2/
      output: { path: "build-2" },
      files: [
        { asset: "stats.json", output: { filename: path.join(__dirname, "build-2/stats.json") } },
        { asset: /[a-f0-9]{20}\.main\.js/, output: { path: "build-2" } },
        { asset: /[a-f0-9]{20}\.main\.js/, output: { filename: "copy.js" } }
      ]
    }),
    new DiskPlugin({ // build-3/
      files: [
        { asset: "stats.json", output: { path: "build-3" } },
        { asset: /[a-f0-9]{20}\.main\.js/, output: { path: "build-3", filename: "yo.js" } }
      ]
    }),

    // Advanced
    new DiskPlugin({ // build-4/
      output: { path: "build-4" },
      files: [
        { asset: "stats.json", output: { filename: "nested/stats.json" } },
        {
          asset: /[a-f0-9]{20}\.main\.js/,
          output: {
            // Custom namer: invert the hash.
            filename: function (name) {
              return "main." + name.match(/[a-f0-9]{20}/)[0] + ".js";
            }
          }
        }
      ]
    }),

    // // EXPECTED FAILURE
    // new DiskPlugin({
    //   files: [
    //     { asset: "stats.json" },
    //     { asset: "stats.json", output: { filename: "stats.json" } }
    //   ]
    // }),

    // HACK: Terminate the entire process so that we can use `webpack-dev-server`
    // in a one-shot manner to check real FS output.
    {
      apply: function (compiler) {
        compiler.plugin("after-emit", process.exit.bind(null, 0));
      }
    }
  ]
};
