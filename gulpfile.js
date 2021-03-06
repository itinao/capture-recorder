/**
 * Desctop Caputure Recorderビルドスクリプト
 */

// config
// *** chromeの拡張機能
var clientBase          = 'client/';
var popupSassFiles      = clientBase + 'scss/*.scss';
var popupSassBuildDir   = clientBase + 'build/css/';
var popupScriptFiles    = ['client/js/class.js', 'client/js/knockout.js', 'client/js/popup.js'];
var popupScriptBuildDir = clientBase + 'build/js/';
var bgScriptFiles       = ['client/js/class.js', 'client/js/RecordRTC.js', 'client/js/gif-recorder.js', 'client/js/capture_recorder.js', 'client/js/background.js'];
var bgScriptBuildDir    = clientBase + 'build/js/';
var clientHtmlFiles     = clientBase + 'html/*.html';
var clientHtmlBuildDir  = clientBase + 'build/html/';


// requires
var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyInline = require('gulp-minify-inline');
var runSequence = require('run-sequence');


/**
 * Google Chrome App タスク
 */
// popup用cssの生成
gulp.task('build-client-popup-sass', function() {
  gulp.src(popupSassFiles)
  .pipe(sass())
  .pipe(concat('popup.css'))
  .pipe(gulp.dest(popupSassBuildDir))
  .pipe(minifyCss())
  .pipe(rename({extname: '.min.css'}))
  .pipe(gulp.dest(popupSassBuildDir));
});
 
// popup用jsの生成
gulp.task('build-client-popup-script', function() {
  gulp.src(popupScriptFiles)
  .pipe(concat('popup.js'))
  .pipe(gulp.dest(popupScriptBuildDir))
  .pipe(uglify())
  .pipe(rename({extname: '.min.js'}))
  .pipe(gulp.dest(popupScriptBuildDir));
});

// background用jsの生成
gulp.task('build-client-bg-script', function() {
  gulp.src(bgScriptFiles)
  .pipe(concat('background.js'))
  .pipe(gulp.dest(bgScriptBuildDir))
  .pipe(uglify())
  .pipe(rename({extname: '.min.js'}))
  .pipe(gulp.dest(bgScriptBuildDir));
});

// web用htmlの生成
gulp.task('build-client-html', function () {
  // knockout.jsを使ってるので comments: trueは必須
  var minifyHtmlOption = {comments: true, quotes: true, spare: false, empty: true};
  gulp.src(clientHtmlFiles)
  .pipe(minifyHtml(minifyHtmlOption))
  .pipe(gulp.dest(clientHtmlBuildDir));
});


// ウォッチャー
gulp.task('build-client-watch', function() {
  gulp.watch(popupSassFiles, function(event) {
    gulp.run('build-client-popup-sass');
  });
  gulp.watch(popupScriptFiles, function(event) {
    gulp.run('build-client-popup-script');
  });
  gulp.watch(bgScriptFiles, function(event) {
    gulp.run('build-client-bg-script');
  });
  gulp.watch(clientHtmlFiles, function(event) {
    gulp.run('build-client-html');
  });
});

// 全て実行
gulp.task('build-client', ['build-client-popup-sass', 'build-client-popup-script', 'build-client-bg-script', 'build-client-html']);

