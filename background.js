chrome.browserAction.onClicked.addListener(function(activeTab){
  var newURL = "app.html";
  chrome.tabs.create({ url: chrome.extension.getURL(newURL) });
});
