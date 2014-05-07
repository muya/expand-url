/**
* add handler for onClicked event
*/
chrome.contextMenus.onClicked.addListener(function(info, tab) {
	console.log('this is the url obtained: ' + info.linkUrl);
	//get shortened url and invoke url shortening service
	//http://api.unshorten.it/?shortURL=http://onforb.es/1j2shAC&apiKey=&responseFormat=json
	var fullUrl = Config.unshorten_url + '?apiKey=' + Config.api_key
		+ '&responseFormat=' + Config.api_response_format + '&shortURL=' + info.linkUrl;
	console.log('full url to invoke: ' + fullUrl);
	$.get(fullUrl, function(data) {
        console.log('response received: ' + data);
        if (data.error === undefined) {
        	//request was ok, try obtain the url
        	var redirectUrl = data.fullurl;
        	chrome.tabs.create({
				url: data.fullurl
			});
        }
        else{
        	console.log('received error from api: ' + data.error);
        }
    }, 'json');

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
