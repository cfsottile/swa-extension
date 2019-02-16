// import { sidebarHtml } from 'sidebar';
// import { preAugment, adjustBuilderSelection } from 'augmentation-handler'

// export { toogleSidebar, addData };

var loaded = false;
var originalPadding = document.getElementsByTagName("body")[0].style["padding-left"];

var data = [];
var amountOfEntries = 0;

function toogleSidebar() {
    if (loaded) { unloadSidebar(); }
    else { loadSidebar(); }
}

function addData(d) {
    data.push(d)
}

function loadSidebar() {
    document.addEventListener("dblclick", updateListener);
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
    doc.getElementById("selector-add").onclick = addSelectionEntry;
    doc.getElementById("selector-many").onchange = handleManySelections;
    doc.getElementById("builder-select").selectedIndex = -1;
    doc.getElementById("builder-select").onchange = adjustBuilderSelection;
    doc.getElementById("injector-button").onclick = injectionListener(doc.getElementById("injector"), 1);
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
    browser.runtime.sendMessage({
        kind: "newtab",
        url: "http://leipert.github.io/vsb/dbpedia/#/workspace",
        data: _selections()
    })
}

function _selections() {
    let data = [];
    for (var i = 1; i <= amountOfEntries; i++) {
        data.push(getSelection(i + "-1"));
    }
    return data;
}

function getSelection(entryNumber) {
    return {
        role: document.getElementById(`swa-selection-role-${entryNumber}`).value,
        value: document.getElementById(`swa-selection-data-${entryNumber}`).value
    }
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

function handleManySelections() {
    checked = document.getElementById("selector-many").checked;
    if (checked) {
        updateManySelectionsFunc();
        addManySelectionsUI();
    } else {
        // removeManySelectionsUI();
    }
}

function addManySelectionsUI() {
    let selectionEntries = Array.from(document.getElementById("selector-group").getElementsByClassName("selection-entry"));
    selectionEntries.forEach((se) => {
        let entryNumber = selectionEntryNumber(se);
        se.appendChild(stringToNode(divSelectionMany(entryNumber)));
        console.log(se, entryNumber);
        se.querySelector(`#select-many-last-${entryNumber}`).onclick =
            selectionNListener(se, `${entryNumber}-2`);
    });
    let injectorDiv = document.getElementById('injector').children[1];
    injector.appendChild(stringToNode(divInjectionMany()));
    injector.querySelector("#inject-many-2").onclick =
        injectionListener(injector, 2);

}

// :: HtmlNode -> Int
// PRE: 'selectionEntry' has the structure of the selection entry div
function selectionEntryNumber(selectionEntry) {
    return selectionEntry.firstElementChild.id.split("-").slice(-2,-1)[0];
}

function addSelectionEntry() {
    amountOfEntries += 1;
    currentEntryNumber = amountOfEntries + "-1";
    newEntry = (new DOMParser()).parseFromString(selectionHtml(amountOfEntries), 'text/html');
    newEntry.getElementById(`select-element-${currentEntryNumber}`).onclick =
        selectionListener(newEntry, currentEntryNumber);
    document.getElementById("selector-group").appendChild(newEntry.body.firstChild);
}

function selectionListener(entry, entryNumber) {
    let currentLabel = entry.getElementById(`selector-xpath-label-${entryNumber}`);
    return () => startListening(selectionHandler(currentLabel, entryNumber));
}

function selectionHandler(currentLabel, entryNumber) {
    return (mouseEvent) => {
        let selectionValue = preExtract(mouseEvent.target, entryNumber);
        addSelection(selectionValue, entryNumber);
        currentLabel.textContent = createXPathFromElement(mouseEvent.target);
    }
}

function selectionNListener(entry, entryNumber) {
    let currentLabel = entry.querySelector(`#selector-xpath-label-${entryNumber}`);
    return () => startListening(genericHandler(currentLabel));
}

function injectionListener(entry, entryNumber) {
    let currentLabel = entry.querySelector(`#injector-xpath-label-${entryNumber}`);
    console.log(entry, entryNumber, currentLabel);
    return () => startListening(genericHandler(currentLabel));
}

function genericHandler(currentLabel) {
    return (mouseEvent) => {
        console.log("changing", currentLabel, "with", createXPathFromElement(mouseEvent.target));
        currentLabel.textContent = createXPathFromElement(mouseEvent.target);
    }
}

// function select(mouseEvent) {
//     updateListener(mouseEvent);
// }

function preExtract(node, entryNumber) {
    console.log("swa-extraction-" + entryNumber);
    const extractionStrategy = document.getElementById("swa-extraction-" + entryNumber).value;
    return extractionStrategies[extractionStrategy](node);
}

function addSelection(selectionValue, entryNumber) {
    // data.push(selection);
    document.getElementById("swa-selection-data-" + entryNumber).value = selectionValue;
}

/*
    PURPOSE: transforms 'str' into an HTML node
    PARAMS: str :: String
*/
function stringToNode(str) {
    return (new DOMParser()).parseFromString(str, 'text/html').body.firstChild;
}