function marginSetting(obj){
  
  if ($.browser.msie && $.browser.version == '6.0') {
    obj.last().css('margin-right', '0px');
    obj.first().css('margin-left', '0px');
  }
  else{
    obj.last().css('margin-right', '10px');
    obj.first().css('margin-left', '10px');
  }    
}

function ulWidthSetting(a, b){

  if ($.browser.msie && $.browser.version == '6.0') {
    return (a * b); //  ширина списка 
  }
  else{
    return (a * b + 20.0); //  ширина списка 
  } 
}


$(document).ready(function(){
  
  var $container = $('.viewport'),
      containerWidth = $container.width(),
      $ul = $('.overview'),
      $li = $ul.children('li');
 
  marginSetting($li);

  var $liLink = $ul.find('a'),
      liLinkWidth = $liLink.width(),
      $paginationLink = $('.pagination').find('a'),
      trackWidth = $('.track').width(), // ширина полосы прокрутки
      $scroller = $('.thumb'), // сам скроллер
      ulWidth;
      
  ulWidth = ulWidthSetting($liLink.size(), liLinkWidth);
        
      
  if(ulWidth<containerWidth){
    $('.scrollbar').hide();
  }    
      
  $ul.attr('style', 'width:'+ ulWidth + 'px'); // устанавливаем ширину списка 

  $paginationLink.each(function(i){
    $(this).attr('rel', i); //  присваиваем всем пунктам списка (т.е. группе слайдов) свой номер)
  });

  $scroller.css('width', trackWidth*containerWidth/ulWidth + 'px');

  //------------- кликаем по пагинатору --------------
  
  $paginationLink.live('click', function(){
    
    var $this = $(this),
        paginationLinkNumber = $this.attr('rel'),  //  номер ссылки в пагинаторе, на которую сейчас кликнули
        
        trackWidth = $('.track').width(), // ширина полосы прокрутки
        $scroller = $('.thumb'), // сам скроллер
        
        $ul = $('.overview'),
        $liLink = $ul.find('a'),
        
        containerLeftPosition = $container.offset().left, // левая позиция контейнера
        containerWidth = $container.width(),
        liLeftPosition = $li.eq(paginationLinkNumber).offset().left,  // левая позиция текущего пункта списка (т.е. группы слайдов. Нужно для подсветки активного пункта пагинатора)
        ulLeftPosition = $ul.offset().left,  // левая позиция списка
        ulRightPosition = $liLink.last().offset().left + $liLink.width(),
        left,
        scrollingLeft,
        shiftCoefficient = (-1)*trackWidth/ulWidth,
        scrollerWidth = trackWidth*containerWidth/ulWidth, 
        delta = containerLeftPosition - liLeftPosition; // смещение списка при клике
   
    $('.pagination').find('.active').removeClass('active');   
    $this.addClass('active');
    $scroller.css('width', scrollerWidth + 'px');

    left = 0;
    scrollingLeft = 0;
 
    if($liLink.size() < 8){
      return;
    }    
 
    if((ulRightPosition - liLeftPosition) < containerWidth){
      left = -(ulWidth - containerWidth);
    } else{
      left = (ulLeftPosition - containerLeftPosition + delta);
    }

    $ul.animate({
      left: left
      }, 500);
      
    scrollingLeft = shiftCoefficient*(ulLeftPosition - containerLeftPosition + delta);
    
    if (scrollingLeft > (trackWidth - scrollerWidth)){
      scrollingLeft = trackWidth - scrollerWidth;
    }
     
    $scroller.animate({
      left: scrollingLeft
      }, 500); 
      
    return false;  
  });
});