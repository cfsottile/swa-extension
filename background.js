browser.browserAction.onClicked.addListener((tab) => {
    console.log("clicked browser action");
    onBrowserAction(tab);
})

function onBrowserAction(tab) {
    doCurrentTab((tab) => {
        browser.tabs.sendMessage(tab.id, { codop: "browser-action" }, null)
    });
}

browser.runtime.onMessage.addListener((msg) => {
    console.log("msg received: ", msg);
    browser.tabs
        .query({})
        .then((tabs) => 
            tabs.forEach((tab) => 
                browser.tabs.sendMessage(tab.id,{ codop: "query-text", args: msg.query})))
});

function doCurrentTab(fn) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) => {
        tabs.forEach(fn);
    });
}