# Laravel Mix imgmin

**Laravel Mix extension to compress images [png,jpg,jpeg,svg,gif,bmp,ico] with TinyPNG.**

## Note

_This extension uses **Gulp 4**. This can create unexpected behavior if you are using older version of Gulp inside your project._

## Installation

Install the extension:

```sh
npm install laravel-mix-imgmin
```

Or if you prefer yarn:

```sh
yarn add laravel-mix-imgmin
```

Next require the extension inside your Laravel Mix config and call `imgmin()` in your pipeline:

```js
// webpack.mix.js
const mix = require('laravel-mix');
require('laravel-mix-imgmin');

mix.js('resources/js/app.js', 'public/js')
    .sass('resources/sass/app.scss', 'public/css')
    .imgmin();
```

## Options

#### Default options

If nothing is passed to the extension inside your Laravel Mix config, the following options will be used:

```js
{
    input: 'resources/img',
    publicPath: 'public',
    output: 'img',
    tinyPngKey: null,
    debug: false
}
```

#### Option details

* `input` (string). Your input directory where images are located.
* `publicPath` (string). Your application's public path.
* `output` (string). Your output directory where compressed images will be saved.
* `tinyPngKey` (string or null). Your [TinyPNG](https://tinypng.com/) key. If you don't provide [TinyPNG](https://tinypng.com/) key, then default [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin) package will be used. [TinyPNG](https://tinypng.com/) is recommended for the best results.
* `debug` (boolean). Whenever to log extension events messages to the console.

#### New in version 0.2.x
* Now supports `laravel-mix` version 6
