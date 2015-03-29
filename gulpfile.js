var gulp = require('gulp');
var gutil = require('gulp-util');
var server = require('gulp-develop-server');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');
var less = require('gulp-less');

gulp.task('server:start', function(cb) {
  server.listen( {
    path: 'server.js',
    env: { NODE_ENV: 'development' }
  }, cb);
});

gulp.task('server:restart', function(cb) {
  server.restart(cb);
});

gulp.task('test', function() {
  return gulp.src(['test/*.js'], { read: false })
           .pipe(mocha({ reporter: 'spec' }))
           .on('error', gutil.log);
});

gulp.task('less', function () {
  return gulp.src('assets/screen.less')
  .pipe(less())
  .pipe(gulp.dest('assets'));
});

gulp.task('watch:daemon', function() {
  gulp.watch(['server.js', 'daemon.js', 'lib/*.js'], ['server:restart', 'test'] );
});

gulp.task('watch:test', function() {
  gulp.watch(['test/*.js'], ['test']);
});

gulp.task('watch:less', function() {
  gulp.watch(['assets/*.less'], ['less']);
});

gulp.task('watch', ['watch:daemon', 'watch:test']);

// doesn't call server.kill() but ok for travis!
gulp.task('travis', function(){
  return gulp.src(['test/*.js'], { read: false })
           .pipe(mocha({ reporter: 'spec' }))
           .pipe(exit());
});

gulp.task('default', ['server:start', 'test', 'less', 'watch']);
