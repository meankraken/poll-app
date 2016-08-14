$(document).ready(function() {
   $("#addPoll").on("click", function() {
       $("#createForm").stop().css("display","block").animate({height:"350px"},250);
   }) ;
   
   $("#cancelButton").on("click", function(e) {
       e.preventDefault();
      $("#createForm").stop().animate({height:"0px"},250, function() {
          $('#createForm').css("display","none");
      });
   });
   
   $("#addPoll").hover(function() {
      $(this).css("border","none"); 
   }, function() {
       $(this).css("border","");
   });
   
   $(document).on("mouseenter", ".poll", function() {
      $(this).css("width","100%"); 
      $(this).css("height","40px");
      $(this).css("border","none");
   });
   
   $(document).on("mouseleave", ".poll", function() {
      $(this).css("width","95%"); 
      $(this).css("height","35px");
      $(this).css("border","");
   });
});