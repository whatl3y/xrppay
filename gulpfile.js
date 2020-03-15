const gulp = require('gulp')
const babel = require('gulp-babel')
const nodemon = require('gulp-nodemon')
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

gulp.task('start', function(done) {
  const stream = nodemon({
    exec: 'nf start',
    ext: 'js',
    tasks: ['build'],
    watch: ['src/**/*.js'],
    done: done
  })

  // stream.on('restart', [ 'build' ])
  stream.on('crash', function() {
    console.error('Application has crashed!\n')
    stream.emit('restart', 10)  // restart the server in 10 seconds
  })
  return stream
})

gulp.task('build', gulp.parallel('src', 'txt'))
