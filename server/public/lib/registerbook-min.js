"use strict";
/*global alert: true, console: true, ODSA */

(function ($) {
  var settings = ODSA.SETTINGS,
      odsaUtils = ODSA.UTILS;

  // Set the book ID (SHA1 hash of the book URL)
  settings.BOOK_ID = odsaUtils.getBookID();
  //function that displays config page

  var b_json = (function () {
    var b_json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': '_static/' + settings.BOOK_NAME + '.json',
        'dataType': "json",
        'success': function (data) {
          b_json = data;
        }
      });
    return b_json;
  })();

  //prepare data to send to the backend
  var jsonBook = {};

  jsonBook.key = odsaUtils.getSessionKey();
  jsonBook.book =  settings.BOOK_ID;
  // Calculate the URL of the book, relative to the current module page
  jsonBook.url = location.href.substring(0, location.href.lastIndexOf('/') + 1);
  jsonBook.b_json = JSON.stringify(b_json);


  function sendConfig() {
    //Add book build date
    jsonBook.build_date = settings.BUILD_DATE;
    $('#bookjson').html("Sending data ...");
    // Send the data to the server
    jQuery.ajax({
      url:   settings.SCORE_SERVER + "/api/v1/module/loadbook/",
      type:  "POST",
      data: jsonBook,
      contentType: "application/json; charset=utf-8",
      datatype: "json",
      xhrFields: {withCredentials: true},
      success: function (data) {
        alert("SUCCESS:\nAll chapters and exercises of book instance " + settings.BOOK_NAME + " have been saved on the data server.");
        $('#bookjson').html("SUCCESS");
        console.log("success: " + data);
      },
      error: function (data) {
        alert("ERROR:\nSomething went wrong when storing chapters and exercises of book instance " + settings.BOOK_NAME + ".\nYou might not have the right to complete this action. Refresh the page, the try again. If the problem persists, contact the administrator.");
        $('#bookjson').html("FAILED");
        console.log("error: " + data);
      }
    });
  }

  //*****************************************************************************
  //***********            Runs When Page Finishes Loading            ***********
  //*****************************************************************************
  $(document).ready(function () {
    $('#bookname').val(settings.BOOK_NAME);
    $('#bookid').val(settings.BOOK_ID);
    //$('#bookjson').html(JSON.stringify(b_json));
    $('#registerbook').click(function () {
      sendConfig();
    });
  });

}(jQuery));
