/* global require, window */
var $ = require('jquery');
$.slick = require('slick-carousel');

$(function () {
  $('#section-carousel').slick({
    autoplay: false,
    arrows: false,
    lazyLoad: 'ondemand',
  });
});

(function () {
  function centerImage() {

    var wrapperHeight = $('#section-carousel').height();
    $('.slick-slider img').each(function () {
      var img = $(this);
      img.css('margin-top', (wrapperHeight - img.height()) / 2);
    });
  }

  $(window).on("load resize", centerImage);
}());
