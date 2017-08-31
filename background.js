browser.browserAction.onClicked.addListener((tab) => {
    console.log("clicked browser action");
    onBrowserAction(tab);
})

function onBrowserAction(tab) {
    doCurrentTab((tab) => {
        browser.tabs.sendMessage(tab.id, { codop: "browser-action" }, null)
    });
}

function doCurrentTab(fn) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) => {
        tabs.forEach(fn);
    });
}