function sendMsgCurrentTab(codop, args, then) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) => {
        tabs.forEach((t) => {
            browser.tabs.sendMessage(
                tab.id,
                { "codop": codop, "args": args },
                then);
        })
    })
}

function selectButton() {
    // xpath = '//*[@id="titleCast"]/table/tbody';
    console.log("1");
    sendMsgCurrentTab(
        "select",
        null,
        (xpath) => document.getElementById("selector-xpath").value = xpath);
}

function performAugmentation() {
    sendMsgCurrentTab(
        "augment",
        { 
            "selector-xpath": document.getElementById("selector-xpath").value,
            "selector-many": document.getElementById("selector-many").value,
            "extractor-select": document.getElementById("extractor-select").value,
            "query": document.getElementById("query").value,
        }, null);
}

function setXpath(xpath) {
    document.getElementById("selector-xpath").value = xpath
}

console.log("loading sidebar");

browser.tabs
    .query({ currentWindow: true, active: true })
    .then((tabs) => 
        browser.tabs.executeScript(
            tabs[0].id,
            { file: "/content_scripts/content_script.js" }));

browser.runtime.onMessage.addListener(setXpath);