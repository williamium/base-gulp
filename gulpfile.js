// Load Gulp and all the plugins
var gulp    = require('gulp'),
concat      = require('gulp-concat'),
uglify      = require('gulp-uglify'),
sourcemaps  = require('gulp-sourcemaps'),
sass        = require('gulp-ruby-sass'),
autoprefix  = require('gulp-autoprefixer'),
minifycss   = require('gulp-minify-css'),
header      = require('gulp-header'),
jshint      = require('gulp-jshint'),
notify      = require('gulp-notify'),
rename      = require('gulp-rename'),
filter      = require('gulp-filter'),
imagemin    = require('gulp-imagemin'),
pngquant    = require('imagemin-pngquant'),
mozjpeg     = require('imagemin-mozjpeg'),
changed     = require('gulp-changed'),
browserSync = require('browser-sync'),
reload      = browserSync.reload;

// Set the banner
var pkg    = require('./package.json'),
dateFormat = require('dateformat'),
now        = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss Z"),
banner     = '/*!\n'+
			 ' * <%= pkg.name %>\n'+
			 ' * @author <%= pkg.author %>\n'+
			 ' * @version <%= pkg.version %>\n'+
			 ' * Build date: '+ now +'\n'+
			 ' */\n';

// JS hint task: Runs JSHint using the options in the .jshintrc file
gulp.task('jshint', function() {
	gulp.src('js/src/*.js')
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(notify(function (file) {
			if (file.jshint.success) {
				return 'JSHint: ' + file.relative + ' (complete).';
			} else {
				return 'JSHint: ' + file.relative + ' (' + file.jshint.results.length + ' errors).';
			}
		}));
});

// Scripts task: Concat, minify & generate sourcemaps
gulp.task('scripts', function() {
	gulp.src('js/src/*.js')
		.pipe(sourcemaps.init())
			.pipe(concat('app.js'))
			.pipe(header(banner, { pkg : pkg } ))
			.pipe(gulp.dest('js/'))
			.pipe(rename('app.min.js'))
			.pipe(uglify())
			.pipe(header(banner, { pkg : pkg } ))
		.pipe(sourcemaps.write('maps', { includeContent: false, sourceRoot: '/js/src' }))
		.pipe(gulp.dest('js/'))
		.pipe(filter('*.js')) // Filter stream so we only get notifications and reloads from JS files, not the maps
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Scripts: ' + file.relative + ' generated.';
		}));
	gulp.src('js/plugins/*.js')
		.pipe(concat('plugins.min.js'))
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest('js/'))
		.pipe(filter('*.js')) // Filter stream so we only get notifications and reloads from JS files, not the maps
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Scripts: ' + file.relative + ' generated.';
		}));
});

// Styles task: Compile Sass, add prefixes and minify
gulp.task('styles', function() {
	gulp.src('css/**/*.scss')
		.pipe(sass({ bundleExec: true, style: 'expanded', sourcemap: true, sourcemapPath: './'/*, compass: true*/ }))
		.pipe(autoprefix())
		.pipe(header(banner, { pkg : pkg } ))
		.pipe(gulp.dest('css/'))
		.pipe(filter('*.css')) // Filter stream so we only get notifications and injections from CSS files, not the maps & so we don't minify the map file
		.pipe(rename({ suffix: ".min" }))
		.pipe(minifycss({ keepSpecialComments: 0 }))
		.pipe(header(banner, { pkg: pkg } ))
		.pipe(gulp.dest('css/'))
		.pipe(reload({ stream: true }))
		.pipe(notify(function (file) {
			return 'Styles: ' + file.relative + ' generated.';
		}));
});

// Image optimisation task: optimises jpegs and pngs
gulp.task('optimise-images', function () {
	gulp.src('img/src/**/*')
		.pipe(changed('img/'))
		.pipe(imagemin({
			progressive: true,
			optimizationLevel: 5,
			use: [pngquant({ quality: '60-80' }), mozjpeg()]
		}))
		.pipe(gulp.dest('img/build/'))
		.pipe(notify({
			onLast: true,
			message: 'Images optimised. See Terminal for savings.'
		}));
});

// Configure and start BrowserSync
gulp.task('browser-sync', function() {
	browserSync({
		proxy: "local.domain.com"
	});
});

// Standard watch task
gulp.task('watch', function() {
	gulp.watch('js/src/*.js', ['jshint', 'scripts']);
	gulp.watch('css/**/*.scss', ['styles']);
});

// Start BrowserSync and watch for changes
gulp.task('watch-and-sync', ['browser-sync'], function() {
	gulp.watch('js/src/*.js', ['jshint', 'scripts']);
	gulp.watch('css/**/*.scss', ['styles']);
});

// Default task: runs tasks immediately and continues watching for changes
gulp.task('default', ['jshint', 'scripts', 'styles'], function() {
	gulp.watch('js/src/*.js', ['jshint', 'scripts']);
	gulp.watch('css/**/*.scss', ['styles']);
});