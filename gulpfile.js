var gulp = require('gulp');
var gutil = require('gulp-util');
var server = require('gulp-develop-server');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');

gulp.task('server:start', function(cb) {
  server.listen( { path: 'daemon.js' }, cb);
});

gulp.task('server:restart', function(cb) {
  server.restart(cb);
});

function runMocha() {
  return gulp.src(['test/*.js'], { read: false })
           .pipe(mocha({ reporter: 'spec' }))
           .on('error', gutil.log);
}

gulp.task('mocha', runMocha);

gulp.task('server:test', ['server:restart'], runMocha);

gulp.task('watch:daemon', function() {
  gulp.watch(['daemon.js'], ['server:test'] );
});

gulp.task('watch:test', function() {
  gulp.watch(['test/*.js'], ['mocha']);
});

gulp.task('init', ['server:start'], runMocha);

gulp.task('watch', ['watch:daemon', 'watch:test']);

gulp.task('test', ['init'], function(){
  server.kill();
});

// doesn't call server.kill() but ok for travis!
gulp.task('travis', ['server:start'], function(){
  return gulp.src(['test/*.js'], { read: false })
           .pipe(mocha({ reporter: 'spec' }))
           .pipe(exit());
});

gulp.task('default', ['init','watch']);
