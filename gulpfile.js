const gulp = require('gulp')
const babel = require('gulp-babel')
const plumber = require('gulp-plumber')

gulp.task('src', function() {
  return gulp.src("./src/**/*.js")
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest("./dist"))
})

gulp.task('txt', function() {
  return gulp.src("./src/**/*.txt")
    .pipe(gulp.dest("./dist"))
})

gulp.task('build', gulp.parallel('src', 'txt'))
