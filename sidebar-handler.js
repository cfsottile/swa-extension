// import { sidebarHtml } from 'sidebar';
// import { preAugment, adjustBuilderSelection } from 'augmentation-handler'

// export { toogleSidebar, setData };

var loaded = false;
var originalPadding = document.getElementsByTagName("body")[0].style["padding-left"];

var data;

function toogleSidebar() {
    if (loaded) { unloadSidebar(); }
    else { loadSidebar(); }
}

function setData(d) {
    data = d
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

function setScripts(doc) {
    doc.getElementById("selector-button").onclick = select("selector");
    doc.getElementById("builder-select").selectedIndex = -1;
    doc.getElementById("builder-select").onchange = adjustBuilderSelection;
    doc.getElementById("injector-button").onclick = select("injector");
    doc.getElementById("augment-button").onclick = preAugment;
    doc.getElementById("vsb-button").onclick = openVSB;
    console.log("loaded")
}

function unloadSidebar() {
    document.getElementsByTagName("body")[0].style["padding-left"] = originalPadding;
    loaded = false;
    var sidebar = document.getElementById("__swa_sidebar");
    sidebar.parentElement.removeChild(sidebar);
}

function openVSB() {
    console.log("Opening VSB");
    console.log(data);
    browser.runtime.sendMessage({
        kind: "newtab",
        url: "http://leipert.github.io/vsb/dbpedia/#/workspace",
        data: data
    })
}

function select(stage) {
    return () => document.addEventListener("dblclick", selectionCallbacks[stage])
}

function adjustBuilderSelection() {
    switch (document.getElementById("builder-select").value) {
        case "N - N - N":
            renderBuilderInput(1);
            setManyInjections(true);
            break;
        case "N - M - 1":
            renderBuilderInput(3);
            setManyInjections(false);
            break;
        case "N - M - N":
            renderBuilderInput(2);
            setManyInjections(true);
            break;
        case "N - N - 1":
            renderBuilderInput(2);
            setManyInjections(false);
            break;
    }
}

function renderBuilderInput(n) {
    let textAreasDiv = document.createElement("div");
    addTextAreas(textAreasDiv, n);
    let builderDiv = document.getElementById("builder-div");
    builderDiv.removeChild(builderDiv.lastChild);
    builderDiv.appendChild(textAreasDiv);
}

function addTextAreas(textAreasDiv, n) {
    for (var i = 1; i <= n; i++) {
        let area = document.createElement("textarea");
        area.id = "building-" + i;
        textAreasDiv.appendChild(area);
    }
    // console.log(textAreasDiv);
}

function setManyInjections(bool) {
    document.getElementById("injector-many").checked = bool;
}