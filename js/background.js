/**
 * add handler for onClicked event
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  console.log('this is the url obtained: ' + info.linkUrl);
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
			if (exUrlAction === "preview"){
				//open page to allow user to preview
				sendMessageToTab(tab.id, {
          "originalTabID": tab.id,
          "origTabIndex": tab.index,
          "clickedUrl": info.linkUrl
        });
			}
			else {
				//default action is redirect
			}
    });



  //get shortened url and invoke url shortening service
  //http://api.unshorten.it/?shortURL=http://onforb.es/1j2shAC&apiKey=&responseFormat=json
  // var fullUrl = Config.unshorten_url + '?apiKey=' + Config.api_key
  // 	+ '&responseFormat=' + Config.api_response_format + '&shortURL=' + info.linkUrl;
  // console.log('full url to invoke: ' + fullUrl);
  // $.get(fullUrl, function(data) {
  //       console.log('response received: ' + data);
  //       if (data.error === undefined) {
  //       	//request was ok, try obtain the url
  //       	var redirectUrl = data.fullurl;
  //       	chrome.tabs.create({
  // 			url: data.fullurl
  // 		});
  //       }
  //       else{
  //       	console.log('received error from api: ' + data.error);
  //       }
  //   }, 'json');

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
  console.log('got this error: ' + chrome.runtime.lastError.message);
});

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
