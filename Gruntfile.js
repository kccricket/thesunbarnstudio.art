/* global module:false, require */

module.exports = function (g) {
  "use strict";

  function π(parts, separator) {
    return parts.map(function(part) { return part.trim().replace(/^[\/]*/g, ''); }).join(separator || '/');
  }

  require('load-grunt-tasks')(g);
  var inliner = require('sass-inline-svg');

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
      //      build_html: {
      //        files: [
      //          {
      //            src: [
      //              "*.html"
      //            ],
      //            dest: π([buildDir,"/"])
      //          },
      //        ]
      //      },
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

    sass: {
      options: {
        sourcemap: 'none',
        functions: {
          svg: inliner(π([buildDir,imagesDir,"/"]))
        }
      },
      build: {
        files: [{
          expand: true,
          src: ['sass/**/*.scss'],
          dest: π([buildDir,cssDir,'/']),
          ext: '.css'
        }]
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
        tasks: ["sass:build"],
      },
      js: {
        files: [
          "js/**/*.js",
          "*.html"
        ],
        tasks: [
          'includes:build_html',
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
    },

    replace_attribute: {
      build_images: {
        options: {
          replace: {
            'pattern[id^="image"]': {
              'xlink:href': π([imagesDir,'%value%'])
            }
          }
        },
        files: {
          [π([buildDir,imagesDir,'sun-barn.svg'])]: π([buildDir,imagesDir,'sun-barn.svg'])
        }
      }
    },

    processhtml: {
      options: {
      },
      build_html: {
        expand: true,
        src: [
          '*.html'
        ],
        dest: π([buildDir,"/"])
      }
    }
  });

  g.registerTask("build", [
    "gitinfo",
    //"copy:build_css",
    //    "copy:build_html",
    'build_images',
    "copy:build_vendor",
    'build_css',
    "browserify",
    "build_html"
  ]);

  g.registerTask('build_html', [
    'processhtml:build_html',
    "link_html"
  ]);

  g.registerTask('build_images', [
    "copy:build_images",
    'image_resize:carousel',
    "tinyimg",
  ]);

  g.registerTask('build_css', [
    "sass:build",
    "postcss"
  ]);
};
