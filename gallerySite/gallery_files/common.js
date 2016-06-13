
/*
$(document).ready(function(){
  var $header = $('header'),
      $footer = $('footer'),
      $content = $('#content'),
      headerBottomBorder = parseInt($header.height()) + parseInt($header.css('padding-top')),
      footerTopBorder=$footer.offset().top,
      middleVertical = (footerTopBorder - headerBottomBorder)/2,
      contentInnerHeight = parseInt($('.content-inner').height()),
      halfContentInnerHeight = contentInnerHeight/2,
      middleHorizontal = parseInt($('.content-inner').width())/2,
      contentWidth = $content.width()/2,
      top = middleVertical - halfContentInnerHeight;
   
      if (top < 0){
        top = 0;
      }

    $('.content-inner').css({
      top: top+'px',
      left: (contentWidth - middleHorizontal)+'px'
    });
    $content.css('height', top + contentInnerHeight + 'px');
   
   $(window).resize(function(){
    var $header = $('header'),
        $footer = $('footer'),
        $content = $('#content'),
        headerBottomBorder = parseInt($header.height()) + parseInt($header.css('padding-top')),
        footerTopBorder=$footer.offset().top,
        middleVertical = (footerTopBorder - headerBottomBorder)/2,
        contentInnerHeight = parseInt($('.content-inner').height()),
        halfContentInnerHeight = contentInnerHeight/2,
        middleHorizontal = parseInt($('.content-inner').width())/2,
        contentWidth = $content.width()/2,
        top = middleVertical - halfContentInnerHeight;
     
        if (top < 0){
          top = 0;
        }

      $('.content-inner').css({
        top: top+'px',
        left: (contentWidth - middleHorizontal)+'px'
      });
      $content.css('height', top + contentInnerHeight + 'px');
   });
   
      
      
});
*/