const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass"),
    prefix = require('gulp-autoprefixer'),
    sync = require("browser-sync").create(),
    imagemin = require("gulp-imagemin"),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fi = require('gulp-file-include'),

    fileSystem = require("fs");

// Create files
function createFiles() {
    createFolders();

    setTimeout(() => {
            fileSystem.writeFile("app/index.html", "!", function (err) {
        if (err) {
            throw err;
        }
        console.log("FileCreated");
    });
    fileSystem.writeFile("app/scss/style.scss", "", function (err) {
        if (err) {
            throw err;
        }
        console.log("FileCreated");
    });
    fileSystem.writeFile("app/js/draft/common.js", "", function (err) {
        if (err) {
            throw err;
        }
        console.log("FileCreated");
    });
    }, 400);
    }

// Create folders
function createFolders() {
    return src('*.*', { read: false })
    .pipe(dest("./app/scss"))
    .pipe(dest("./app/js/draft"))
    .pipe(dest("./app/img"))
    .pipe(dest("./app/_img"))
    .pipe(dest("./app/fonts"))
};

//HTML Parts
const fileinclude = function () {
    return src(["app/pages/**.html"])
        .pipe(fi({
            prefix: '@@',
            basepath: 'app/pages'
        }))
        .pipe(dest("app"));
}

// Dev
function convertStyles() {
    return src('app/scss/style.scss')

        .pipe(scss({
                outputStyle: 'compressed'
        }))
        .pipe(prefix(
            {
            grid: true,
            cascade: true,
            flex: true
            }
        ))
        .pipe(dest('app/css'));
};

function imageCompressed() {
    return src('app/_img/*.{jpg,png,svg}')
        .pipe(imagemin())
    .pipe(dest('app/img'))
}

function browserSync() {
    sync.init({
        server: {
         baseDir: "app",
            open: "local"
        }
    });
};

function watchFiles() {
    watch('app/scss/**/*.scss', convertStyles);
    watch('app/*.html').on('change', sync.reload);
    watch('app/css/*.css').on('change', sync.reload);
    watch('app/js/*.js').on('change', sync.reload);
    watch('app/_img', imageCompressed);
    watch('app/fonts/*.ttf', series(convertFonts, fontsStyle));
    watch('app/pages/**/*.html', fileinclude);
    
};

exports.convertStyles = convertStyles;
exports.watchFiles = watchFiles;
exports.browserSync = browserSync;
exports.imageCompressed = imageCompressed;

//Folders
exports.struct = createFiles;

exports.default = parallel(fileinclude ,convertStyles, watchFiles, browserSync, series(convertFonts, fontsStyle));

// build

function moveHTML() {
    return src('app/*.html')
    .pipe(dest('dist'))
}
function moveCSS() {
    return src('app/css/*.css')
    .pipe(dest('dist/css'))
}
function moveJS() {
    return src('app/js/*.js')
    .pipe(dest('dist/js'))
}
function moveIMG() {
    return src('app/img/*')
    .pipe(dest('dist/img'))
}

exports.moveHTML = moveHTML;
exports.moveCSS = moveCSS;
exports.moveJS = moveJS;
exports.moveIMG = moveIMG;
exports.fileinclude = fileinclude;


exports.build = series(moveHTML, moveCSS, moveJS, moveIMG);


function convertFonts() {
    src(["./app/fonts/*.ttf"]).pipe(ttf2woff()).pipe(dest("./app/fonts/"));
    return src(["./app/fonts/*.ttf"]).pipe(ttf2woff2()).pipe(dest("./app/fonts/"));
}


// Конвертировать TTF шрифты
exports.convertFonts = convertFonts;
exports.fontsStyle = fontsStyle;

exports.cFonts = series(convertFonts, fontsStyle);

//! Font Face для шрифтов
const cb = () => {};

let srcFonts = "./app/scss/_fonts.scss";
let appFonts = "./app/fonts";

function fontsStyle() {
    
    let file_content = fileSystem.readFileSync(srcFonts);

    fileSystem.writeFile(srcFonts, "", cb);
    fileSystem.readdir(appFonts, function (err, items) {
        if (items) {
            let c_fontname;
            for (let i = 0; i < items.length; i++) {
                let fontname = items[i].split(".");
                fontname = fontname[0];
                if (c_fontname != fontname) {
                    fileSystem.appendFile(
                        srcFonts,
                        '@include font-face("' +
                            fontname +
                            '", "' +
                            fontname +
                            '", 400);\n',
                        cb
                    );
                }
                c_fontname = fontname;
            }
        }
    });
}