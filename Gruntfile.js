/* global module:false, require */

module.exports = function (g) {
  "use strict";

  function π(parts, separator) {
    return parts.map(function(part) { return part.trim().replace(/^[\/]*/g, ''); }).join(separator || '/');
  }

  require('load-grunt-tasks')(g);

  var buildDir = "_build";
  var imagesDir = "img";
  var cssDir = "css";
  var jsDir = "js";
  var fontsDir = π([cssDir,"fonts"]);
  var distDir = "dist";

  g.initConfig({
    pkg: g.file.readJSON("package.json"),

    copy: {
      build_css: {
        files: [
          {
            src: [
              π([cssDir,"**/*.css"])
            ],
            dest: π([buildDir,"/"])
          },
        ]
      },
      build_html: {
        files: [
          {
            src: [
              "*.html"
            ],
            dest: π([buildDir,"/"])
          },
        ]
      },
      build_images: {
        files: [
          {
            src: [
              π([imagesDir,"*"]),
              "!"+π([imagesDir,"**/*.svg"])
            ],
            dest: π([buildDir,"/"])
          }
        ]
      },
      build_vendor: {
        files: [
          {
            expand: true,
            cwd: "node_modules/slick-carousel/slick",
            src: [
              "*.css",
              "fonts/*"
            ],
            dest: π([buildDir,cssDir,"vendor/slick/"])
          }
        ]
      }
    },

    compass: {
      build: {
        options: {
          sassDir: "sass/",
          cssDir: π([buildDir,cssDir,"/"]),
          relativeAssets: true,
          imagesDir: π([imagesDir,"/"])
        }
      }
    },

    link_html: {
      build: {
        jsFiles: [
          π([jsDir,"vendor/**/*.js"]),
          π([jsDir,"*.js"])
        ],
        cssFiles: [
          π([cssDir,"**/*.css"])
        ],
        targetHtml: [
          '*.html'
        ],
        options: {
          cwd: '_build',
        }
      }
    },

    watch: {
      css: {
        files: ["sass/**/*.scss"],
        tasks: ["compass:build"],
      },
      js: {
        files: [
          "js/**/*.js",
          "*.html"
        ],
        tasks: [
          "copy:build_html",
          "browserify:build",
          "link_html:build"
        ]
      },
      options: {
        // Start a live reload server on the default port 35729
        livereload: true,
      },
    },

    browserify: {
      build: {
        src: [
          π([jsDir,"main.js"])
        ],
        dest: π([buildDir,jsDir,"main.js"])
      }
    },

    postcss: {
      options: {
        map: false,
        processors: [
          require('autoprefixer')()
        ]
      },
      build: {
        src: [
          π([buildDir,cssDir,'**/*.css'])
        ]
      }
    },

    tinyimg: {
      build: {
        files: [
          {
            expand: true,
            src: [
              π([imagesDir,'**/*.svg'])
            ],
            dest: π([buildDir,'/'])
          }
        ]
      }
    },

    image_resize: {
      carousel: {
        options: {
          height: 1250,
          width: '',
          quality: 0.75,
          overwrite: false
        },
        src: π([imagesDir,'carousel/*.jpg']),
        dest: π([buildDir,imagesDir,'carousel/'])
      }
    }
  });

  g.registerTask("build", [
    "gitinfo",
    "copy:build_css",
    "copy:build_html",
    "copy:build_images",
    'image_resize:carousel',
    "copy:build_vendor",
    "compass",
    "postcss",
    "tinyimg",
    "browserify",
    "link_html"
  ]);
};
