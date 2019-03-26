// import { sidebarHtml } from 'sidebar';
// import { preAugment, adjustBuilderSelection } from 'augmentation-handler'

// export { toogleSidebar, addData };

var loaded = false;
var originalPadding = document.getElementsByTagName("body")[0].style["padding-left"];

var data = [];
var amountOfEntries = 0;
var stageHandler;
var selectionType = SelectionEntrySingle;
var injectionType = InjectionMap;

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
    swaStyles = document.createElement("style");
    document.head.appendChild(swaStyles);
    stageHandler = new StageHandler(swaStyles);
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
    doc.querySelector("#builder-select").value = "Map";
    doc.getElementById("injector-button").onclick = injectionListener(doc.getElementById("injector"), 1);
    doc.getElementById("try-button").onclick = preAugment;
    // doc.getElementById("save-button").onclick = preAugment;
    doc.getElementById("vsb-button").onclick = openVSB;
    doc.querySelectorAll(".next-button").forEach(e => e.onclick = () => stageHandler.next());
    doc.querySelectorAll(".previous-button").forEach(e => e.onclick = () => stageHandler.previous());
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
        case "Map":
            renderBuilderInput(1);
            preBuild = preBuildMap;
            injectionType = InjectionMap;
            // setManyInjections(true);
            break;
        case "Converge":
            renderBuilderInput(2);
            preBuild = preBuildConvergence;
            injectionType = InjectionConvergence;
            // setManyInjections(false);
            break;
        // case "N - M - 1":
        //     renderBuilderInput(3);
        //     setManyInjections(false);
        //     break;
        // case "N - M - N":
        //     renderBuilderInput(2);
        //     setManyInjections(true);
        //     break;
    }
}

function renderBuilderInput(n) {
    let textAreasDiv = document.createElement("div");
    textAreasDiv.id = "swa-builder-textarea";
    addTextAreas(textAreasDiv, n);
    let builderTextareaDiv = document.getElementById("swa-builder-textarea-div");
    builderTextareaDiv.removeChild(builderTextareaDiv.querySelector("#swa-builder-textarea"));
    builderTextareaDiv.appendChild(textAreasDiv);
}

function addTextAreas(textAreasDiv, n) {
    for (var i = 1; i <= n; i++) {
        let area = document.createElement("textarea");
        area.id = "building-" + i;
        area.style = "margin-top: 2px; width: 304px; height: 91px";
        textAreasDiv.appendChild(area);
    }
    // console.log(textAreasDiv);
}

function setManyInjections(bool) {
    document.getElementById("injector-many").checked = bool;
}

function handleManySelections() {
    selectionType = SelectionEntryMultiple;
    checked = document.getElementById("selector-many").checked;
    if (checked) {
        // updateManySelectionsFunc();
        selectionType = SelectionEntryMultiple;
        addManySelectionsUI();
    } else {
        // rollbackManySelectionsFunc();
        removeManySelectionsUI();
    }
}

function addManySelectionsUI() {
    let selectionEntries = Array.from(document.getElementById("selector-group").getElementsByClassName("selection-entry"));
    selectionEntries.forEach((se) => {
        se.querySelector(".select-element").value = "Select first element";
        se.querySelector(".selection-value-label-1").textContent = "Value of first element";
        let entryNumber = selectionEntryNumber(se);
        se.querySelector(".selection-buttons").appendChild(stringToNode(buttonSelectionLast(entryNumber)));
        se.querySelector(".selection-xpaths").appendChild(stringToNode(selectionXpathLast(entryNumber)));
        se.querySelector(".selection-values").appendChild(stringToNode(valueLastSelection(entryNumber)));
        console.log(se, entryNumber);
        se.querySelector(`#select-many-last-${entryNumber}`).onclick =
            selectionNListener(se, `${entryNumber}-2`);
    });
    let injectorDiv = document.getElementById('injector').children[1];
    injector.querySelector(".injection-buttons").appendChild(stringToNode(buttonInjectionLast()));
    injector.querySelector(".injection-xpaths").appendChild(stringToNode(injectionXpathLast()));
    injector.querySelector("#injector-button").value = "Select first node";
    injector.querySelector("#inject-many-2").onclick = injectionListener(injector, 2);
}

function removeManySelectionsUI() {

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
    let currentLabel = entry.getElementById(`selector-xpath-span-${entryNumber}`);
    return () => startListening(selectionHandler(currentLabel, entryNumber));
}

function selectionHandler(currentLabel, entryNumber) {
    return (mouseEvent) => {
        let selectionValue = gatherValue(mouseEvent.target, entryNumber);
        addSelection(selectionValue, entryNumber);
        currentLabel.textContent = createXPathFromElement(mouseEvent.target);
    }
}

function selectionNListener(entry, entryNumber) {
    return () => startListening(selectionNHandler(entry));
    // return () => startListening(genericHandler(currentLabel));
}

function selectionNHandler(entry) {
    return (mouseEvent) => {
        entry.querySelector(".selection-value-2").value = gatherLastValue(mouseEvent.target, entry);
        entry.querySelector(".selection-xpath-2").textContent = createXPathFromElement(mouseEvent.target);
    }
}

function injectionListener(entry, entryNumber) {
    let currentLabel = entry.querySelector(`#injector-xpath-span-${entryNumber}`);
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

function gatherValue(node, entryNumber) {
    console.log("swa-extraction-" + entryNumber);
    const extractionStrategy = document.getElementById("swa-extraction-" + entryNumber).value;
    return extractionStrategies[extractionStrategy](node);
}

function gatherLastValue(node, entry) {
    const extractionStrategy = entry.querySelector(".swa-extraction").value;
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