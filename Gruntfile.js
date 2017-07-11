/* global module:false, require */
/* jshint esnext:true */

module.exports = function (g) {
  "use strict";

  function π(parts, separator) {
    return parts.map(function(part) { return part.trim().replace(/^\/+/g, ''); }).join(separator || '/').replace(/^\/+/, '');
  }

  function cpo(b) {
    return {
      base: b.trim().replace(/^[\/]*/g, ''),
      dir: π([b, '/']),
      img: π([b, 'img/']),
      css: {
        dir: π([b, 'css/']),
        vendor: π([b, 'css/vendor/']),
      },
      sass: π([b, 'sass/']),
      js: {
        dir: π([b, 'js/']),
        vendor: π([b, 'js/vendor/'])
      },
      html: {
        dir: π([b, 'html/']),
        pages: π([b, 'html/pages/']),
        partials: π([b, 'html/partials/']),
        layouts: π([b, 'html/layouts/'])
      },
    };
  }

  require('load-grunt-tasks')(g);
  var inliner = require('sass-inline-svg');

  var src = cpo('src');
  var build = cpo('_build');
  var dist = cpo("dist");
  var rel = cpo('');

  g.initConfig({
    pkg: g.file.readJSON("package.json"),

    //  ╔═╗╔═╗╔═╗╦ ╦
    //  ║  ║ ║╠═╝╚╦╝
    //  ╚═╝╚═╝╩   ╩
    copy: {
      //  |_    o| _|   _ _ _
      //  |_)|_|||(_|__(__\_\
      build_css: {
        files: [
          {
            expand: true,
            cwd: src.css.dir,
            src: [
              '**/*.css'
            ],
            dest: build.css.dir
          },
        ]
      },
      //  |_    o| _|  o._ _  _ (~| _ _
      //  |_)|_|||(_|__|| | |(_| _|}__\
      build_images: {
        files: [
          {
            expand: true,
            cwd: src.img,
            src: [
              "**",
              "!**/*.svg"
            ],
            dest: build.img
          }
        ]
      },
      //  |_    o| _|     _._  _| _ ._
      //  |_)|_|||(_|__\/}_| |(_|(_)|
      build_vendor: {
        files: [
          {
            expand: true,
            cwd: "node_modules/slick-carousel/slick",
            src: [
              "*.css",
              "fonts/*"
            ],
            dest: π([build.css.vendor, 'slick/'])
          },
          {
            expand: true,
            cwd: "node_modules/normalize.css",
            src: [
              "normalize.css"
            ],
            dest: π([build.css.vendor,"normalize/"])
          }
        ]
      },
      //   _| _
      //  (_|}_\/
      dev: {
        files: [
          {
            expand: true,
            cwd: build.dir,
            src: [
              π([rel.css.dir, '**/*.css']),
              π([rel.img, 'carousel/*']),
              π([rel.js.dir, '**/*.js'])
            ],
            dest: dist.dir
          },
          {
            expand: true,
            cwd: build.html.dir,
            src: [
              '**/*.html',
            ],
            dest: dist.dir
          }
        ]
      }
    },


    //  ╔═╗╔═╗╔═╗╔═╗
    //  ╚═╗╠═╣╚═╗╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝
    sass: {
      options: {
        sourcemap: 'none',
        functions: {
          svg: inliner(build.img)
        }
      },
      build: {
        files: [
          {
            expand: true,
            cwd: 'node_modules/bulma',
            src: 'bulma.sass',
            dest: π([build.css.vendor, 'bulma/']),
            ext: '.css'
          },
          {
            expand: true,
            cwd: src.sass,
            src: '**/*.scss',
            dest: build.css.dir,
            ext: '.css'
          }
        ]
      }
    },


    //  ╦  ╦╔╗╔╦╔═    ╦ ╦╔╦╗╔╦╗╦
    //  ║  ║║║║╠╩╗    ╠═╣ ║ ║║║║
    //  ╩═╝╩╝╚╝╩ ╩────╩ ╩ ╩ ╩ ╩╩═╝
    link_html: {
      options: {
        cwd: dist.dir
      },
      build: {
        jsFiles: [
          π([rel.js.vendor, '**/*.js']),
          π([rel.js.dir, "*.js"])
        ],
        cssFiles: [
          π([rel.css.vendor,"**/*.css"]),
          π([rel.css.dir,"*.css"])
        ],
        targetHtml: [
          '**/*.html'
        ],
      }
    },


    //  ╦ ╦╔═╗╔╦╗╔═╗╦ ╦
    //  ║║║╠═╣ ║ ║  ╠═╣
    //  ╚╩╝╩ ╩ ╩ ╚═╝╩ ╩
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
          π([src.js.dir, "**/*.js"]),
          π([src.html.dir, "**/*.hbs"])
        ],
        tasks: [
          "browserify:build",
          "build_html"
        ]
      },
      grunt: {
        files: [
          'Gruntfile.js'
        ],
        tasks: 'dev'
      },
      options: {
        // Start a live reload server on the default port 35729
        livereload: true,
      },
    },


    //  ╔╗ ╦═╗╔═╗╦ ╦╔═╗╔═╗╦═╗╦╔═╗╦ ╦
    //  ╠╩╗╠╦╝║ ║║║║╚═╗║╣ ╠╦╝║╠╣ ╚╦╝
    //  ╚═╝╩╚═╚═╝╚╩╝╚═╝╚═╝╩╚═╩╚   ╩
    browserify: {
      build: {
        src: [
          π([src.js.dir, "main.js"])
        ],
        dest: π([build.js.dir, "main.js"])
      }
    },


    //  ╔═╗╔═╗╔═╗╔╦╗╔═╗╔═╗╔═╗
    //  ╠═╝║ ║╚═╗ ║ ║  ╚═╗╚═╗
    //  ╩  ╚═╝╚═╝ ╩ ╚═╝╚═╝╚═╝
    postcss: {
      options: {
        map: false,
        processors: [
          require('autoprefixer')()
        ]
      },
      build: {
        src: [
          π([build.css.dir, '**/*.css'])
        ]
      }
    },


    // ╔╦╗╦╔╗╔╦ ╦╦╔╦╗╔═╗
    //  ║ ║║║║╚╦╝║║║║║ ╦
    //  ╩ ╩╝╚╝ ╩ ╩╩ ╩╚═╝
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

    //  ╦═╗╔═╗╔═╗╦  ╔═╗╔═╗╔═╗    ╔═╗╔╦╗╔╦╗╦═╗╦╔╗ ╦ ╦╔╦╗╔═╗
    //  ╠╦╝║╣ ╠═╝║  ╠═╣║  ║╣     ╠═╣ ║  ║ ╠╦╝║╠╩╗║ ║ ║ ║╣
    //  ╩╚═╚═╝╩  ╩═╝╩ ╩╚═╝╚═╝────╩ ╩ ╩  ╩ ╩╚═╩╚═╝╚═╝ ╩ ╚═╝
    replace_attribute: {
      build_images: {
        options: {
          replace: {
            'image': {
              'xlink:href': π([rel.img, 'carousel', '%value%']),
            }
          }
        },
        files: {
          [π([build.img, 'sun-barn.dist.svg'])]: π([build.img, 'sun-barn.svg'])
        }
      }
    },

    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗╦ ╦╔╦╗╔╦╗╦
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗╠═╣ ║ ║║║║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝╩ ╩ ╩ ╩ ╩╩═╝
    processhtml: {
      options: {
        includeBase: build.dir
      },
      build_html: {
        expand: true,
        cwd: build.html.dir,
        src: [
          '**/*.html'
        ],
        dest: build.html.dir
      }
    },


    //  ╔═╗╔═╗╔═╗╔═╗╔╦╗╔╗ ╦  ╔═╗
    //  ╠═╣╚═╗╚═╗║╣ ║║║╠╩╗║  ║╣
    //  ╩ ╩╚═╝╚═╝╚═╝╩ ╩╚═╝╩═╝╚═╝
    assemble: {
      options: {
        layoutdir: src.html.layouts,
        layout: 'standard',
        partials: π([src.html.partials, '**/*.hbs']),
        layoutext: '.hbs',
        pkg: '<%= pkg %>',
      },
      build_html: {
        expand: true,
        cwd: src.html.pages,
        src: [
          '**/*.hbs'
        ],
        dest: build.html.dir
      }
    }

  });

  g.registerTask('build', [
    'gitinfo',
    'build_images',
    'copy:build_vendor',
    'build_css',
    'browserify',
    'build_html'
  ]);

  g.registerTask('build_html', [
    'assemble:build_html',
    'processhtml:build_html'
  ]);

  g.registerTask('build_images', [
    'copy:build_images',
    'tinyimg',
    'replace_attribute:build_images'
  ]);

  g.registerTask('build_css', [
    'sass:build',
    'postcss'
  ]);
  g.registerTask('dev', [
    'build',
    'copy:dev',
    'link_html'
  ]);
};
