chrome.runtime.onConnectExternal.addListener(function(port) {
  console.log("Connected by external application");
  port.onMessage.addListener(function(msg) {
    if (msg.command === "openTab" && msg.url) {
      chrome.tabs.create({ url: msg.url }, function(tab) {
        console.log("New tab opened with URL:", msg.url);
        port.postMessage({ status: "success", tabId: tab.id });
      });
    } else {
      port.postMessage({
        status: "error",
        message: "Invalid command or missing URL.",
      });
    }
  });
});