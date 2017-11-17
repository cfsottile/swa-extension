function doCurrentTab(fn) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) => {
        tabs.forEach(fn);
    });
}

var loaded = false;
var originalPadding = document.getElementsByTagName("body")[0].style["padding-left"];

function onClickedBrowserAction() {
    if (loaded) { unloadSidebar(); }
    else { loadSidebar(); }
}

function loadSidebar() {
    document.getElementsByTagName("body")[0].style["padding-left"] = "350px";
    loaded = true;
    document.getElementsByTagName("body")[0].appendChild(prepareSidebar());
}

function prepareSidebar() {
    var sidebar = document.createElement("div");
    sidebar.id = '__swa_sidebar';
    setStyles(sidebar);
    let tmpdoc = (new DOMParser()).parseFromString(sidebarHtml(), 'text/html');
    setScripts(tmpdoc);
    sidebar.appendChild(tmpdoc.body.firstChild);
    return sidebar;
}

function setStyles(sidebar) {
    sidebar.style.position = 'fixed';
    sidebar.style.left = '0px';
    sidebar.style.top = '0px';
    sidebar.style["z-index"] = 9999;
    sidebar.style.width = '350px';
    sidebar.style.height = '100%';
    sidebar.style["background-color"] = 'white';
}

let replace = () => {
    let toBeReplaced = document.getElementById("swa-text-replaced").value;
    let replacement = document.getElementById("swa-text-replacement").value;
    let query = document.getElementById("sparql-query").textContent
    document.getElementById("sparql-query").textContent = query.replace(new RegExp(toBeReplaced, 'g'), replacement);
}

let sendQuery = () => {
    browser.runtime.sendMessage({query: document.getElementById("sparql-query").textContent})
}

function setScripts(doc) {
    doc.getElementById("swa-btn-replace").onclick = replace;
    doc.getElementById("swa-btn-query-ready").onclick = sendQuery;
}

function unloadSidebar() {
    document.getElementsByTagName("body")[0].style["padding-left"] = originalPadding;
    loaded = false;
    var sidebar = document.getElementById("__swa_sidebar");
    sidebar.parentElement.removeChild(sidebar);
}

browser.runtime.onMessage.addListener(request => {
    console.log(request);
    // return Promise.resolve({response: run(request.codop, request.args)});
    run(request);
});

function run(request) {
    return ops[request.codop](request.args);
}

let processQueryText = (queryText) => {
    document.getElementById("query").value = queryText;
}

const ops = {
    "browser-action": onClickedBrowserAction
}

function sidebarHtml() {
    return `
        <div>
        <h3>Semantic Web Augmentation</h3>
            <div>
                Replace <input type="text" name="replaced" id="swa-text-replaced"><br>
                with <input type="text" name="replacement" id="swa-text-replacement"><br>
                <button type="button" id="swa-btn-replace">Replace</button>
                <button type="button" id="swa-btn-query-ready">Send query</button>
            </div>
        </div>
    `;
}