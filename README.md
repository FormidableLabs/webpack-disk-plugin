Webpack Disk Plugin
===================

[![Build Status][trav_img]][trav_site]

This plugin will take an arbitrary Webpack compiler asset (e.g., a JS, CSS,
HTML, or other plugin-generated file) and write it directly to disk.

Normally this wouldn't be needed, but a specific good use case is when using
`webpack-dev-server` that only has files available in memory over a network and
you need to access a real file on disk. Potential situations where this comes
up is in development with a Node.js server on the backend that ingests a
webpack-produced file.

## Installation

The plugin is available via [npm](https://www.npmjs.com/package/webpack-disk-plugin):

```
$ npm install --save webpack-disk-plugin
```

## Examples

You can see lots of examples at
[`demo/webpack.config.js`](demo/webpack.config.js).

### Basic

Options:

* `output.path`: The base directory to write assets to.
* `files`: An array of objects to map an asset to a file path. For each item:
    * `asset`: A regex or string to match the name in the webpack compiler.
      Note that something like `[hash].main.js` will be _fully expanded_ to
      something like `e49186041feacefb583b.main.js`.
    * `output`: An object with additional options:
        * `path`: Override the top-level `output.path` directory to write too.
        * `filename`: A specified filename to write to. Can be a straight string
          or a function that gets the asset name to further mutate.

Notes:

* **Can only have 1 unique output path**: 2+ files cannot target the same full
  file path. At the same time, you _can_ have 2+ _input_ asset matches.

Here's a basic use case that copies and renames one file.

```js
var DiskPlugin = require("webpack-disk-plugin");

module.exports = {
  plugins: [
    // Everything else **first**.

    // Write out asset files to disk.
    new DiskPlugin({
      output: {
        path: "build"
      },
      files: [
        { asset: "stats.json" },
        { asset: /[a-f0-9]{20}\.main\.js/, output: { filename: "file.js" } }
      ]
    }),
  ]
}
```


Here's an advanced use case that has nested directories and functionally renames
files:

```js
var DiskPlugin = require("webpack-disk-plugin");

module.exports = {
  plugins: [
    // Everything else **first**.

    // Write out asset files to disk.
    new DiskPlugin({
      output: { path: "build" },
      files: [
        { asset: "stats.json", output: { filename: "nested/stats.json" } },
        {
          asset: /[a-f0-9]{20}\.main\.js/,
          output: {
            // Custom namer: invert the hash.
            filename: function (name) { return "main." + name.match(/[a-f0-9]{20}/)[0] + ".js"; }
          }
        }
      ]
    }),
  ]
}
```

## Contributions

Contributions welcome! Make sure to pass `$ npm run check`.

[trav]: https://travis-ci.org/
[trav_img]: https://api.travis-ci.org/FormidableLabs/webpack-disk-plugin.svg
[trav_site]: https://travis-ci.org/FormidableLabs/webpack-disk-plugin
