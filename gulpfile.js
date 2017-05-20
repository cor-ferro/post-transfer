const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');

gulp.task('dev', () => {
	gulp.src('src/**/*.js')
		.pipe(watch('src/**/*.js'))
		.pipe(plumber())
		.pipe(babel())
		.pipe(gulp.dest('dist'))
		.on('error', gutil.log);
});
