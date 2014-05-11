/**
 * add handler for onClicked event
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  //if user has selected auto-redirection, the do that, else, let them preview
  chrome.storage.sync.get('open_expanded_url_action',
    function(data) {
      if (chrome.runtime.lastError !== undefined) {
        //throw an error
        sendMessageToTab(tab.id, {
          "error": chrome.i18n.getMessage('previewDefaultError'),
          "originalTabID": tab.id,
          "origTabIndex": tab.index
        });
        return;
      }
      if (data.open_expanded_url_action === undefined) {
        //should be updated with default settings
        data.open_expanded_url_action = Config.default_expand_url_action;
      }
      var exUrlAction = data.open_expanded_url_action;
      if (exUrlAction === "preview") {
        //open page to allow user to preview
        sendMessageToTab(tab.id, {
          "originalTabID": tab.id,
          "origTabIndex": tab.index,
          "clickedUrl": info.linkUrl
        });
      } else {
        //default action is redirect automatically
        $.ajax({
          type: "POST",
          url: Config.expand_url_api,
          data: {
            'shortUrl': info.linkUrl
          },
          success: (function(response) {
            //stop animation
            $('#translateToImg').remove();
            if (response.status === undefined) {
              //an error probably caused us to get malformed response
              sendMessageToTab(tab.id, {
                "error": chrome.i18n.getMessage('unableToResolveUrl'),
                "originalTabID": tab.id,
                "origTabIndex": tab.index
              });
              return;
            } else if (response.status === 1) {
              //invocation OK, got a url, we expect a long url in response.data.expandedUrl
              var expandedUrl = response.data.expandedUrl;
              chrome.tabs.create({
                'url': expandedUrl
              });
              return;
            } else {
              //other unknown error occurred
              sendMessageToTab(tab.id, {
                "error": chrome.i18n.getMessage('unableToResolveUrl'),
                "originalTabID": tab.id,
                "origTabIndex": tab.index
              });
            }
          })
        });
      }
    });
});

/**
 * create context menu that should show for links
 */
chrome.contextMenus.create({
  "id": "open_context_menu",
  "type": "normal",
  "title": chrome.i18n.getMessage("context_menu_title"),
  "contexts": ["link"]
}, function() {
  console.error('got this error: ' + chrome.runtime.lastError.message);
});

/**
* function used for opening the preview page, and sending additional info to it
*/
function sendMessageToTab(tabID, data) {
  chrome.tabs.create({
    'url': chrome.extension.getURL('preview.html'),
    'index': (data.origTabIndex + 1)
  }, function(tab) {
    //send message to created tab with details that we want there
    data.openedTabID = tab.id;
    chrome.tabs.sendMessage(tab.id, data);
  });
}
