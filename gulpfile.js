// dependencies
var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    postcss = require('gulp-postcss'),
    cssmin = require('gulp-cssmin'),
    rename = require('gulp-rename'),
    connect = require("gulp-connect"),
    bump = require('gulp-bump'),
    header = require('gulp-header'),
    moment = require('moment'),
    pkg = require('./package.json')

// define header
var banner = ['/*!',
  ' Skeleton Framework',
  ' | <%= pkg.version %>',
  ' | <%= pkg.license %>',
  ' | ' + moment().format("MMM Do, YYYY"),
  ' */',
  '\n\n'
  ].join('')

// define paths
var paths = {
  src: {
    css: 'src/skeleton.css',
    html: 'src/index.html',
    //js: 'src/skeleton.js',
    images: 'src/images'
  },
  dev: {
    css: 'dev/css',
    html: 'dev',
    //js: 'dev/js',
    images: 'dev/images'
  },
  dist: {
    css: 'dist/css',
    //html: 'dist',
    //js: 'dist/js',
    //images: 'dist/images'
  },
  watch: ["src/**/*", "dev/**/*"],
  serve: {
    root: 'dev'
  }
}

// postcss plugins
var processors = [
  require('postcss-import')(),
  require('postcss-custom-properties')(),
  require('postcss-calc')({
    precision: 10
  }),
  require('autoprefixer-core')()
]

// css build options
var css = function (options) {
  return gulp.src(options.src)
    .pipe(postcss(processors))
    .pipe(gulpif(options.banner, header(banner, { pkg : pkg } )))
    .pipe(gulpif(options.pkgname, rename({ basename: pkg.name })))
    .pipe(gulp.dest(options.dest))
    .pipe(gulpif(options.minify, rename({
      extname: ".min.css"
    })))
    .pipe(gulpif(options.minify, cssmin(options.cssmin)))
    .pipe(gulpif(options.minify, gulp.dest(options.dest)))
}

// html build options
var html = function (options) {
  return gulp.src(options.src)
    .pipe(gulp.dest(options.dest))
}

// image options TODO: optimize images
var images = function (options) {
  return gulp.src(options.src)
    .pipe(gulp.dest(options.dest))
}

/* javascript build options TODO: minimize js
var js = function (options) {
  return gulp.src(options.src)
    .pipe(gulp.dest(options.dest))
}
*/

 gulp.task('dev', function() {
  css({
    src: paths.src.css,
    banner: false,
    minify: false,
    dest: paths.dev.css,
  })
  html({
    src: paths.src.html,
    dest: paths.dev.html,
  })
  /*
  js({
    src: paths.src.js,
    dest: paths.dev.js,
  })
  */
  images({
    src: paths.src.images,
    dest: paths.dev.images,
  })
})

function setLiveReload() {
  // if we have a RELOAD env variable set, use that otherwise default to false
    return process.env.RELOAD === "true" ? true : false
}

var useLiveReload = setLiveReload()

gulp.task("serve", function () {
  connect.server({
    root: paths.serve.root,
    port: process.env.PORT || 3000,
    livereload: useLiveReload
  })
})

// watches the dev dir for changes and hits the reload button
gulp.task('reload', function () {
  gulp.src(paths.serve.root)
    .pipe(connect.reload())
})

// watch src files
gulp.task('watch', function() {
  gulp.watch(paths.watch, ['dev'])
  if (useLiveReload)
    gulp.watch(paths.watch, ['reload'])
})

// create a new release
function release(options) {
  return gulp.src('./package.json')
    .pipe(bump({type: options}))
    .pipe(gulp.dest('./'))
}

gulp.task('patch', function() { return release('patch'); })
gulp.task('feature', function() { return release('minor'); })
gulp.task('release', function() { return release('major'); })

// create production ready files
gulp.task('prod', function() {
  css({
    src: paths.css.src,
    banner: true,
    minify: true,
    pkgname: false,
    cssmin: {
      advanced: true,
      aggressiveMerging: true,
      benchmark: false,
      compatibility: '*',
      debug: false,
      keepBreaks: false,
      mediaMerging: true,
      roundingPrecision: 10,
      shorthandCompacting: false
    },
    dest: paths.dist.css
  })
})

// create a dev build, watch it for changes and serve it on localhost:3000
gulp.task('default', ['dev', 'watch', 'serve'])
