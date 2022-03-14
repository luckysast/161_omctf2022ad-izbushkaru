  $(document).ready(function() {

      $("#investor").click(function() {
          $(".welcome-block").hide();
          $(".investor-form").slideDown(400);
      });
      $(".investor-form .btn-back").click(function() {
          $(".investor-form").hide();
          $(".welcome-block").slideDown(400);
      });


      $("#partner").click(function() {
          $(".welcome-block").hide();
          $(".partner-form").slideDown(400);
      });
      $(".partner-form .btn-back").click(function() {
          $(".partner-form").hide();
          $(".welcome-block").slideDown(400);
      });

      $("#organization").click(function() {
          $(".welcome-block").hide();
          $(".organization-form").slideDown(400);
      });
      $(".organization-form .btn-back").click(function() {
          $(".organization-form").hide();
          $(".welcome-block").slideDown(400);
      });
  });