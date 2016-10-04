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
    open: false,
    domain: 'http://localhost:3000',
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
    require('postcss-assets'),
    require('postcss-inline-svg'),
    require('postcss-svgo'),
    require('doiuse')({
      browsers: [
        'Chrome 30',
        'Firefox 38',
        'IE 9',
        'Android 2.3',
        'iOS 7.1'
      ],
      onFeatureUsage: function (usageInfo) {
        console.log(usageInfo.message);
      }
    }),
    require('postcss-easysprites')({
      imagePath: './src/img/sprites',
      spritePath: './dist/img',
      stylesheetPath: './dist/css'
    }),
    require('postcss-at2x'),
    require('autoprefixer'),
    require('stylefmt')
  ];

  return gulp.src('src/css/**/*.css')
  .pipe($.postcss(CONFIG))
  .pipe($.if(PRODUCTION, $.postcss([require('cssnano')])))
  .pipe(gulp.dest('dist/css/'));
});

gulp.task('watch', function () {
  gulp.watch(['src/css/**/*.css']).on('change', gulp.series('css', browser.reload));
  gulp.watch(['*.html']).on('change', gulp.series(browser.reload));
});

gulp.task('default', gulp.series('clean', 'images', 'css', 'server', 'watch'));
