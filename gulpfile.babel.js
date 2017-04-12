import gulp from 'gulp';
import del from 'del';
import typescript from 'gulp-typescript';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';
import jasmine from 'gulp-jasmine';

const paths = {
    dist: './dist/',
    src: {
        ts: './src/**/*.ts'
    },
    spec: './spec/**/*.spec.js',
    tsConfig: './tsconfig.json'
}

const clean = () => del([ paths.dist ]);
export { clean };

export function scripts() {
    var tsProject = typescript.createProject(paths.tsConfig);
    return tsProject.src()
        .pipe(tsProject()).js
        .pipe(gulp.dest(paths.dist))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.dist));
}

function unitTest() {
    return gulp.src(paths.spec)
        .pipe(jasmine({includeStackTrace: true}));
}

export function watch() {
  gulp.watch(paths.src.ts, gulp.series(scripts, test));
}

export const build = gulp.series(clean, scripts);
export const test = gulp.series(build, unitTest);
export default build;