
$(function () {
   
    $('.show_hide').click(function () {
       ref = $(this).attr('ref')
       $('#'+ref).toggle();
    });
});
