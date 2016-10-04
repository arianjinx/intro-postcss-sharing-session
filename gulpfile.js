var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browser = require('browser-sync');
var rimraf = require('rimraf');
var yargs = require('yargs');

var PRODUCTION = !!(yargs.argv.production);

gulp.task('clean', function (done) {
  rimraf('dist', done);
});

gulp.task('server', function (done) {
  browser.init({
    injectChanges: true,
    server: './',
    port: 4000,
    open: false,
    domain: 'http://localhost:4000',
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false
    },
    notify: {
      styles: {
        top: 'auto',
        bottom: '0'
      }
    }
  });
  done();
});

gulp.task('images', function () {
  return gulp.src('src/img/**/*')
  .pipe(gulp.dest('./dist/img'));
});

gulp.task('css', function () {
  var CONFIG = [
    require('postcss-import'),
    require('postcss-simple-vars'),
    require('postcss-nested'),
    require('postcss-inline-svg'),
    require('postcss-svgo'),
    require('doiuse')({
      // Get these data from Google Analytics
      browsers: [
        'Chrome 30',
        'Firefox 38',
        'IE 9',
        'Android 2.3',
        'iOS 7.1'
      ],
      ignoreFiles: ['**/normalize.css']
      // onFeatureUsage: function (usageInfo) {
      //   console.log(usageInfo.message);
      // }
    }),
    require('postcss-easysprites')({
      imagePath: './src/img/sprites',
      spritePath: './dist/img',
      stylesheetPath: './dist/css'
    }),
    require('postcss-custom-media'),
    require('autoprefixer'),
    require('postcss-reporter'),
    require('stylefmt')
  ];

  return gulp.src('src/css/**/*.css')
  .pipe($.postcss(CONFIG))
  .pipe($.if(PRODUCTION, $.postcss([
    require('postcss-url')({
      url: 'rebase'
    })], {
    from: 'src/css/*.css',
    to: 'dist/css/*.css'
  })))
  .pipe($.if(PRODUCTION, $.postcss([require('cssnano')])))
  .pipe(gulp.dest('dist/css/'));
});

gulp.task('watch', function () {
  gulp.watch(['src/css/**/*.css']).on('change', gulp.series('css', browser.reload));
  gulp.watch(['src/img/**/*.*']).on('change', gulp.series('images', browser.reload));
  gulp.watch(['*.html']).on('change', gulp.series(browser.reload));
});

gulp.task('default', gulp.series('clean', 'images', 'css', 'server', 'watch'));
