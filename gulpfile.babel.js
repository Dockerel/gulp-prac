import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
//live webserver
import ws from "gulp-webserver";
//image
import image from "gulp-image";
//scss -> scss파일의 _reset, _variables 의 "_"는 compile 하지말고 사용만 하라고 알려주는 역할
import gulp_sass from "gulp-sass";
import node_sass from "node-sass";
const sass = gulp_sass(node_sass);

import autoprefixer from "gulp-autoprefixer";

import miniCSS from "gulp-csso";

import bro from "gulp-bro";

import babelify from "babelify";

import ghPages from "gulp-gh-pages";

const routes = {
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    src: "src/js/main.js",
    dest: "build/js",
    watch: "src/js/**/*.js",
  },
};

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const pug = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build", ".publish"]);

const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));

const img = () =>
  gulp.src(routes.img.src).pipe(image()).pipe(gulp.dest(routes.img.dest));

const styles = () =>
  gulp
    .src(routes.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));

const ghDeploy = () => gulp.src("build/**/*").pipe(ghPages());

const watch = () => {
  gulp.watch(routes.pug.watch, gulp.series([pug]));
  gulp.watch(routes.img.src, gulp.series([img]));
  gulp.watch(routes.scss.watch, gulp.series([styles]));
  gulp.watch(routes.js.watch, gulp.series([js]));
};

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, ghDeploy, clean]);
