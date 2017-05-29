const gulp = require('gulp');
const babel = require('gulp-babel');

const paths = {
	srcPattern: 'src/**/*.js',
	dist: 'dist',
};

gulp.task('dev', () => {
	const watch = require('gulp-watch');
	const plumber = require('gulp-plumber');
	const gutil = require('gulp-util');

	gulp.src(paths.srcPattern)
		.pipe(watch(paths.srcPattern))
		.pipe(plumber())
		.pipe(babel())
		.pipe(gulp.dest(paths.dist))
		.on('error', gutil.log);
});

gulp.task('build', () => {
	gulp.src(paths.srcPattern)
		.pipe(babel())
		.pipe(gulp.dest(paths.dist))
		.on('error', error => console.error(error));
});
