/* global module:false */

module.exports = function (g) {
  "use strict";

  require('load-grunt-tasks')(g);

  var buildDir = "_build";
  var imagesDir = "img";
  var cssDir = "css";
  var jsDir = "js";
  var fontsDir = cssDir+"/fonts";
  var distDir = "dist";

  g.initConfig({
    pkg: g.file.readJSON("package.json"),

    copy: {
      dev: {
        files: [
          {
            src: [
              "*.html",
              jsDir+"/**/*.js",
              cssDir+"/**/*.css",
              imagesDir+"/**",
            ],
            dest: buildDir+"/"
          },
          {
            expand: true,
            cwd: "node_modules/slick-carousel/slick",
            src: "slick.js",
            dest: buildDir+"/"+jsDir+"/vendor",
          },
          {
            expand: true,
            cwd: "node_modules/slick-carousel/slick",
            src: ["*.css", "fonts/*"],
            dest: buildDir+"/"+cssDir+"/vendor/slick",
          }
        ]
      }
    },

    compass: {
      dev: {
        options: {
          sassDir: "sass/",
          cssDir: buildDir+"/"+cssDir+"/",
          relativeAssets: true,
          imagesDir: imagesDir+"/",
          //          javscriptsDir: jsDir,
        }
      }
    },

    link_html: {
      dev: {
        jsFiles: [jsDir+"/vendor/**/*.js", jsDir+"/*.js"],
        cssFiles: [cssDir+"/**/*.css"],
        targetHtml: ['*.html'],
        options: {
          cwd: '_build',
        }
      }
    },

    watch: {
      css: {
        files: ["sass/**/*.scss"],
        tasks: ["compass:dev"],
      },
      js: {
        files: ["js/**/*.js", "*.html"],
        tasks: ["copy:dev", "link_html:dev"],
      },
      options: {
        // Start a live reload server on the default port 35729
        livereload: true,
      },
    },
  });

  g.registerTask("dev", [
    "gitinfo",
    "copy",
    "compass",
    "link_html",
  ]);
};