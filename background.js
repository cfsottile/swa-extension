browser.browserAction.onClicked.addListener((tab) => {
    console.log("clicked browser action");
    console.log(tab)
    onBrowserAction(tab);
})

var vsbData;

function onBrowserAction(tab) {
    browser.tabs.sendMessage(tab.id, { codop: "browser-action" })
}

browser.runtime.onMessage.addListener((msg) => {
    console.log("msg received: ", msg);
    switch (msg.kind) {
        case "newtab":
            vsbData = msg.data;
            browser.tabs.create({ url: msg.url });
            break;
        case "vsb-ready":
            sendMsgToTabs({codop: "data", query: vsbData});
            break;
        default:
            sendMsgToTabs({codop: msg.codop, args: msg.query});
            break;
    }
});

function sendMsgToTabs(msg) {
    browser.tabs
        .query({})
        .then((tabs) => 
            tabs.forEach((tab) => 
                browser.tabs.sendMessage(tab.id,msg)))
}

// function init(tabId, msg) {
//     load(tabId, "node_modules/webextension-polyfill/dist/browser-polyfill.js")
//         .then(load(tabId, "visual_sparql.js")
//             .then(() => {
//                 console.log(tabId, msg);
//                 browser.tabs.sendMessage(tabId,{codop: "data", query: msg.data})
//             }))
        
// }

// function load(tabId, filename) {
//     console.log("loading script:", filename)
//     return browser.tabs.executeScript(tabId, {
//         file: filename,
//         allFrames: true
//     });
// }

function doCurrentTab(fn) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) => {
        tabs.forEach(fn);
    });
}