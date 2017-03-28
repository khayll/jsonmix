import gulp from 'gulp';
import del from 'del';
import typescript from 'gulp-typescript';
import uglify from 'gulp-uglify';
import rename from 'gulp-rename';

const paths = {
    dist: './dist/',
    src: {
        ts: './src/**/*.ts'
    },
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

export function watch() {
  gulp.watch(paths.src.ts, scripts);
  gulp.watch(paths.styles.src, styles);
}

const build = gulp.series(clean, scripts);
export default build;