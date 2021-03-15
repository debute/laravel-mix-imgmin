const mix = require('laravel-mix');
const gulp = require('gulp');
const batch = require('gulp-batch');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const tinypng = require('gulp-tinypng-extended');
const watch = require('gulp-watch');
const through = require('through2');
const path = require('path');

class Imgmin {

    name() {
        return 'imgmin';
    }

    dependencies() {
        return ['gulp', 'gulp-tinypng-extended', 'gulp-plumber', 'gulp-imagemin', 'gulp-changed', 'gulp-batch', 'gulp-watch', 'through2'];
    }

    register(options) {
        this.options = Object.assign({
            input: 'resources/img',
            publicPath: 'public',
            output: 'img',
            tinyPngKey: null,
            debug: false
        }, options || {});
    }

    compress(cb) {
        let imgsPath = '/**/*.{svg,gif,bmp,ico}';
        let self = this;
        let imgsRelativePath = path.resolve(__dirname, this.options.input) + path.sep;
        let outputPath = this.options.publicPath + '/' + this.options.output;

        if(this.options.tinyPngKey === null) {
            imgsPath = '/**/*.{png,jpg,jpeg,svg,gif,bmp,ico}';
        }

        gulp.src(this.options.input + imgsPath)
            .pipe(changed(outputPath))
            .pipe(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: false },
                        { cleanupIDs: false }
                    ]
                })
            ]))
            .pipe(gulp.dest(outputPath))
            .pipe(through.obj((file, enc, _cb) => {
                let filePath = file.path.replace(imgsRelativePath, '');

                self.log('[compressed] ' + filePath);
                _cb(null, file);
                self.reload();
            }));

        if(this.options.tinyPngKey !== null) {
            gulp.src(this.options.input + '/**/*.{png,jpg,jpeg}')
                .pipe(changed(outputPath))
                .pipe(plumber())
                .pipe(tinypng({
                    key: this.options.tinyPngKey,
                    sigFile: '.gulp/.tinypng-sigs',
                    log: self.options.debug,
                }))
                .pipe(plumber.stop())
                .pipe(gulp.dest(outputPath))
                .pipe(through.obj((file, enc, _cb) => {
                    let filePath = file.path.replace(imgsRelativePath, '');

                    self.log('[tinypng] ' + filePath);
                    _cb(null, file);
                    self.reload();
                }));
        }

        gulp.src([
            this.options.input + '/**/*',
            "!" + this.options.input + '/**/*.{png,jpg,jpeg,svg,gif,bmp,ico}'
        ]).pipe(gulp.dest(outputPath))
            .pipe(through.obj((file, enc, _cb) => {
                let filePath = file.path.replace(imgsRelativePath, '');

                self.log('[copied] ' + filePath);
                _cb(null, file);
            }));

        if(!!cb) cb();
    }

    boot() {
        let self = this;

        if(this.options.tinyPngKey === null) {
            this.error('`tinyPngKey` is not specified! Images won\'t be compressed through TinyPNG API.');
        }

        watch(this.options.input + '/**', batch((events, cb) => {
            self.compress(cb);
        }));
        this.compress();
    }

    webpackConfig(webpackConfig) {
        this.webpackOriginalAfterCallback = webpackConfig.devServer.onAfterSetupMiddleware;

        let self = this;

        this.log('webpack config updated');
        webpackConfig.devServer.onAfterSetupMiddleware = (server, compiler) => {
            self.after(server, compiler);
        };
    }

    after(server, compiler) {
        if(typeof this.webpackOriginalAfterCallback === 'function') {
            this.webpackOriginalAfterCallback(server, compiler);
        }

        this.serverHandler = server;
        this.log('webpack server handler attached');
    }

    reload() {
        if(typeof this.serverHandler !== 'undefined') {
            this.serverHandler.sockWrite(this.serverHandler.sockets, "content-changed");
        }
    }

    log(message) {
        if(this.options.debug === true) {
            console.log('laravel-mix-imgmin: ' + message);
        }
    }

    error(message) {
        console.error('laravel-mix-imgmin: ' + message);
    }

}

mix.extend('imgmin', new Imgmin());
