const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const plumber = require('gulp-plumber');
const gutil = require('gulp-util');

const paths = {
	srcPattern: 'src/**/*.js',
	dist: 'dist',
};

gulp.task('dev', () => {
	gulp.src(paths.srcPattern)
		.pipe(watch(paths.srcPattern))
		.pipe(plumber())
		.pipe(babel())
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

gulp.task('build', () => {
	gulp.src(paths.srcPattern)
		.pipe(plumber())
		.pipe(babel())
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});
