/* global module:false, require */
/* jshint esnext:true */

module.exports = function (g) {
  "use strict";

  function π(parts, separator) {
    return parts.map(function(part) { return part.trim().replace(/^[\/]*/g, ''); }).join(separator || '/');
  }

  function cpo(base) {
    return {
      dir: π([base, '/']),
      img: π([base, 'img/']),
      css: π([base, 'css/']),
      vendorcss: π([base, 'vendor', 'css/']),
      sass: π([base, 'sass/']),
      js: π([base, 'js/']),
      jsvendor: π([base, 'js/vendor/']),
      pages: π([base, 'pages/'])
    };
  }

  require('load-grunt-tasks')(g);
  var inliner = require('sass-inline-svg');

  var src = cpo('src');
  var build = cpo('_build');
  var dist = cpo("dist");

  g.initConfig({
    pkg: g.file.readJSON("package.json"),

    copy: {
      build_css: {
        files: [
          {
            src: [
              π([src.css,"**/*.css"])
            ],
            dest: build.dir
          },
        ]
      },
      build_images: {
        files: [
          {
            src: [
              π([src.img,"*"]),
              "!"+π([src.img,"**/*.svg"])
            ],
            dest: build.dir
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
            dest: π([build.vendorcss, 'slick/'])
          },
          {
            expand: true,
            cwd: "node_modules/normalize.css",
            src: [
              "normalize.css"
            ],
            dest: π([build.vendorcss,"normalize/"])
          }
        ]
      }
    },

    sass: {
      options: {
        sourcemap: 'none',
        functions: {
          svg: inliner(build.img)
        }
      },
      build: {
        files: [{
          expand: true,
          src: π([src.sass,'**/*.scss']),
          dest: build.css,
          ext: '.css'
        }]
      }
    },

    link_html: {
      build: {
        jsFiles: [
          π([src.jsvendor, '**/*.js']),
          π([src.js, "*.js"])
        ],
        cssFiles: [
          π([build.css,"**/*.css"])
        ],
        targetHtml: [
          π([build.pages,'**/*.html'])
        ],
        options: {
          cwd: build.dir,
        }
      }
    },

    watch: {
      css: {
        files: [
          π([src.sass, "**/*.scss"])
        ],
        tasks: [
          "build_css"
        ],
      },
      js: {
        files: [
          π([src.js, "**/*.js"]),
          π([src.pages, "**/*.hbs"])
        ],
        tasks: [
          "browserify:build",
          "build_html"
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
          π([src.js, "main.js"])
        ],
        dest: π([build.js, "main.js"])
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
          π([build.css, '**/*.css'])
        ]
      }
    },

    tinyimg: {
      build: {
        files: [
          {
            cwd: src.img,
            expand: true,
            src: [
              '**/*.svg'
            ],
            dest: build.img
          }
        ]
      }
    },

    /*    image_resize: {
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
    },*/

    replace_attribute: {
      build_images: {
        options: {
          replace: {
            'image': {
              'xlink:href': 'img/%value%'
            }
          }
        },
        files: {
          [π([build.img, 'sun-barn.dist.svg'])]: π([build.img, 'sun-barn.svg'])
        }
      }
    },

    processhtml: {
      options: {
      },
      build_html: {
        expand: true,
        cwd: build.pages,
        src: [
          '**/*.html'
        ],
        dest: build.pages
      }
    },

    assemble: {
      options: {
        layout: 'standard.hbs',
        layoutdir: 'layouts/',
        partials: 'partials/**/*.hbs'
      },
      build_html: {
        expand: true,
        cwd: src.pages,
        src: [
          '**/*.hbs'
        ],
        dest: build.pages
      }
    }

  });

  g.registerTask('build', [
    'gitinfo',
    //"copy:build_css",
    //    "copy:build_html",
    'build_images',
    'copy:build_vendor',
    'build_css',
    'browserify',
    'build_html'
  ]);

  g.registerTask('build_html', [
    'processhtml:build_html',
    'assemble:build_html',
    'link_html'
  ]);

  g.registerTask('build_images', [
    'copy:build_images',
    //'image_resize:carousel',
    'tinyimg',
    'replace_attribute:build_images'
  ]);

  g.registerTask('build_css', [
    'sass:build',
    'postcss'
  ]);
};
