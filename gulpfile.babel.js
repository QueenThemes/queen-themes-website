import gulp from 'gulp';
import gulploadplugins from 'gulp-load-plugins';
import yargs from 'yargs';
import browserSync from 'browser-sync';
import path from 'path';
import del from 'del';
import notifier from 'node-notifier';
import source from 'vinyl-source-stream';
import rollup from 'rollup-stream';
import builtIns from 'rollup-plugin-node-builtins';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import es from 'event-stream';

const $ = gulploadplugins({
    lazy: true
});

const argv = yargs.argv;

const outputName = (string) => {
    const removed = path.parse(string);
    return path.parse(removed['name']);
};

function handleError(error) {
    $.util.log('⚠️ ⚠️ ⚠️');
    $.util.log($.util.colors.magenta(error.message));
    if(error.codeFrame) {
        $.util.log(error.codeFrame);
    }
    const fileName = error.filename || error.file;
    notifier.notify({
        title: `Error: ${fileName.split('/').pop()}`,
        message: error.message.split(':').slice(1)
    });
    this.emit('end');
}

// SASS Styles
gulp.task('styles', () => {
    return gulp.src([
        'src/scss/*.scss'
    ])
        .pipe($.changed('.tmp/styles', {extension: '.css'}))
        .pipe($.if(!argv.production, $.sourcemaps.init()))
        .pipe($.sassVariables({
            $production: (argv.production == true)
        }))
        .pipe($.sass({
            precision: 10
        }).on('error', handleError))
        .pipe($.autoprefixer())
        .pipe(gulp.dest('.tmp'))
        // Concatenate and minify styles if production mode (via gulp styles --production)
        .pipe($.if('*.css' && argv.production, $.cleanCss()))
        .pipe($.if(!argv.production, $.sourcemaps.write()))
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.stream())
        .pipe($.size({title: 'styles.css'}));
});

// Scripts - app.js is the main entry point, you have to import all required files and modules
gulp.task('scripts', () => {
    return gulp.src('src/js/**/*.js', (err, files) => {
        const fileTasks = files.map((entry) => {
            const output = outputName(entry);
            return rollup({
                input: entry,
                format: 'iife',
                plugins: [
                    builtIns(),
                    resolve(),
                    commonjs(),
                    babel({
                        presets: [
                            [
                                'env',
                                {
                                    'modules': false
                                }
                            ]
                        ],
                        babelrc: false,
                        plugins: [
                            'external-helpers'
                        ]
                    }),
                    uglify()
                ]
            })
                .pipe(source(`${output['name']}.min.js`))
                .pipe(gulp.dest('./public/js'));
        });
        return es.merge(fileTasks);
    });
});

// a task that ensures the `scripts` task is complete before reloading browsers
gulp.task('scripts-reloader', ['scripts'], (done) => {
    browserSync.reload();
    done();
});

gulp.task('static', () => {
    return gulp.src(['src/**/*.{html,php,jpg,jpeg,png,gif,webp,mp4,svg,ico,eot,ttf,woff,woff2,otf,js}','!src/js']).pipe(gulp.dest('public'));
});

// Browser-Sync
gulp.task('serve', ['styles', 'scripts', 'static'], () => {
    browserSync({
        notify: false,
        server: ['.tmp', 'public']
    });

    gulp.watch(['src/scss/**/*.{scss,css}'], ['styles']);
    gulp.watch(['src/js/**/*.js'], ['scripts-reloader']);
    gulp.watch(['src/**/*.{html,php,jpg,jpeg,png,gif,webp,mp4,svg,ico,eot,ttf,woff,woff2,otf,js}','!src/js'], ['static']).on('change', (event) => {
        browserSync.reload();
        if(event.type === 'deleted') {
            let filePathFromSrc = path.relative(path.resolve('src'), event.path);
            let destFilePath = path.resolve('public', filePathFromSrc);
            del.sync(destFilePath);
        }
    });
});

gulp.task('build', ['styles', 'scripts', 'static']);
