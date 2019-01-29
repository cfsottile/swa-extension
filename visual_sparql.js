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
var subjects = []
var dataNode;;

const ops = {
    "browser-action": onClickedBrowserAction,
    "data": setDataNode
}

function onClickedBrowserAction() {
    if (loaded) { unloadSidebar(); }
    else { loadSidebar(); }
}

function loadSidebar() {
    document.getElementsByTagName("body")[0].style["padding-left"] = "350px";
    loaded = true;
    document.getElementsByTagName("body")[0].appendChild(prepareSidebar());
    browser.runtime.sendMessage({
        kind: "vsb-ready"
    })
}

function prepareSidebar() {
    var sidebar = document.createElement("div");
    sidebar.id = '__swa_sidebar';
    setStyles(sidebar);
    let tmpdoc = (new DOMParser()).parseFromString(sidebarHtml(subjects), 'text/html');
    setScripts(tmpdoc);
    dataNode = stringToNode(dataDiv(), 'text/html');
    tmpdoc.body.firstChild.append(dataNode);
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

// function replace() {
//     let toBeReplaced = document.getElementById("swa-text-replaced").value;
//     let replacement = "{{" + document.getElementById("swa-text-replacement").value + "}}";
//     let query = document.getElementById("sparql-query").textContent;
//     document.getElementById("sparql-query").textContent = query.replace(new RegExp(toBeReplaced, 'g'), replacement);
// }

function replace() {
    let replacements = document.getElementById("swa-subjects-data").getElementsByTagName("div");
    let query = document.getElementById("sparql-query").textContent;
    for (var i = 0; i < replacements.length; i++) {
        console.log("replacing", value(replacements[i]), role(replacements[i]));
        query = query.replace(
            new RegExp(value(replacements[i]), 'g'),
            "{{" + role(replacements[i]) + "}}");
    }
    document.getElementById("sparql-query").textContent = query;
}

function value(div) {
    return div.children[0].value
}

function role(div) {
    return div.children[2].value
}

function sendQuery() {
    browser.runtime.sendMessage({
        codop: "query-text",
        query: document.getElementById("sparql-query").textContent
    })
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

function run(request) {
    let fn = ops[request.codop];
    if (fn !== undefined) {
        console.log(request.query);
        fn(request.query);
    } else {
        console.log("Message not understood");
    }
}

browser.runtime.onMessage.addListener(request => {
    console.log(request);
    // return Promise.resolve({response: run(request.codop, request.args)});
    run(request);
});

function processQueryText(queryText) {
    document.getElementById("query").value = queryText;
}

// ss : [(Value,Rol)]
function setDataNode(subjectsData) {
    console.log(subjectsData);
    subjects = subjectsData;
    subjectsData.forEach((subject) => {
        console.log("appending", subject, dataNode);
        dataNode.appendChild(stringToNode(subjectDiv(subject), 'text/html'));
    })
}

function sidebarHtml(subjects) {
    return `
        <div>
            <h3>Semantic Web Augmentation</h3>
            <div>
                <button type="button" id="swa-btn-replace">Generalize</button>
                <button type="button" id="swa-btn-query-ready">Send query</button>
            </div>
        </div>
    `;
}

/*
    PURPOSE:
        describes the HTML node corresponding to the div containing subjects
        data.
*/
function dataDiv() {
    return `
        <div id="swa-subjects-data">
            <h4>Data</h4>
        </div>
    `
}

/*
    PURPOSE: describes the HTML node corresponding to 'subject' data.
    PARAMS: subject :: {value,role}
*/
function subjectDiv(subject) {
    return `
        <div>
            Value <input type="text" name="replaced" value="${subject.value}"><br>
            has role <input type="text" name="replacement" value="${subject.role}"><br>
        </div>
    `
}

/*
    PURPOSE: transforms 'str' into an HTML node
    PARAMS: str :: String
*/
function stringToNode(str) {
    return (new DOMParser()).parseFromString(str, 'text/html').body.firstChild;
}
