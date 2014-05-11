/**
 * this listener will wait for messages from the extension and action them
 */
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    //add id of tab to the close button
    $('#closePreviewTab')
      .attr('data-opened-tab-id', request.openedTabID)
      .attr('data-orig-tab-id', request.originalTabID);
    //check if there was an error
    if (request.error !== undefined) {
      //message sent was an error msg
      displayUserAlert('error', request.error);
      return;
    }
    onPreviewLoad(request);
  });

//activities defined in here should run when we load the preview page
function onPreviewLoad(request) {
  //first, make the request to fetch original url
  $.ajax({
    type: "POST",
    url: Config.expand_url_api,
    data: {
      'shortUrl': request.clickedUrl
    },
    success: (function(response){
      //stop animation
      $('#translateToImg').remove();
      if(response.status === undefined){
        //an error probably caused us to get malformed response
        //enable error msg
        $('#resolvedUrl').css('display', 'none');
        $('#unResolvedUrl').css('display', 'initial');
      }
      else if (response.status === 1){
        //invocation OK, got a url, we expect a long url in response.data.expandedUrl
        var expandedUrl = response.data.expandedUrl;
        $('#resolvedUrl').text(expandedUrl);
        $('#openExpandedURL').attr('href', expandedUrl).css('display', 'initial');
      }
      else{
        //other unknown error occurred
        console.error('received non-success status | status: ' + response.data.status
          + ' | message: ' + response.data.message);
        $('#resolvedUrl').css('display', 'none');
        $('#unResolvedUrl').css('display', 'initial');
      }
    })
  });
  //meanwhile...
  //show originalUrlDiv
  $('#originalUrlDiv').css('display', 'block');
  //load receved url into required div
  $('#shortenedUrl').text(request.clickedUrl);
  //translates to image
  // translateToImg
  $('#translateToImg').css('display', 'block');
  animateLoadingImage();

}

/**
* this function defines animation to make the 'loading' image appear to 'pulse'
*/
function animateLoadingImage() {
  $.when(
    $('#translateToImg').delay(200).animate({
      opacity: '1'
    }, 500, 'linear'),

    $('#translateToImg').delay(400).animate({
      opacity: '0'
    }, 500, 'linear')
  ).then(animateLoadingImage);
}


/**
 * this listener will bind to the close button to close the preview tab
 */
$(function() {
  $('#closePreviewTab').click(function() {
    //make the original tab active (enhance UX)
    chrome.tabs.update(parseInt($(this).attr('data-orig-tab-id'), 10), {
      active: true
    });
    //then remove the tab
    chrome.tabs.remove(parseInt($(this).attr('data-opened-tab-id'), 10));
  });
});

//load all content for all page elements that require i18n
//(got this gem from: http://goo.gl/sDPHYh  :)
$(function() {
  $('[data-i18n]').each(function() {
    var el = $(this);
    var key = el.data('i18n');
    if (key === "versionText") {
      el.html(chrome.i18n.getMessage(key, [chrome.i18n.getMessage(
        "extName"), getVersion()]));
    } else {
      //default handling
      el.html(chrome.i18n.getMessage(key));
    }
  });
});
