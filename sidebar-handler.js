// import { sidebarHtml } from 'sidebar';
// import { preAugment, adjustBuilderSelection } from 'augmentation-handler'

// export { toogleSidebar, addData };

var loaded = false;
var originalPadding = document.getElementsByTagName("body")[0].style["padding-left"];

var data = [];
var amountOfEntries = 0;
var entriesStatus = [false];

function listeningEntry() {
    return entriesStatus.indexOf(true);
}

function startListening(entryNumber) {
    entriesStatus[entryNumber] = true;
}

function cleanEntriesStatus() {
    entriesStatus = entriesStatus.map(() => false);
}

function toogleSidebar() {
    if (loaded) { unloadSidebar(); }
    else { loadSidebar(); }
}

function addData(d) {
    data.push(d)
}

function loadSidebar() {
    console.log("hola");
    document.addEventListener("dblclick", select);
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
    doc.getElementById("injector-button").onclick = injectionListener;
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
        data.push(getSelection(i))
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
        addManySelectionsUI();
    } else {
        removeManySelectionsUI();
    }
}

function addManySelectionsUI() {
    let selectionEntries = Array.from(document.getElementById("selector-group").getElementsByClassName("selection-entry"));
    selectionEntries.forEach((se) => {
        let entryNumber = selectionEntryNumber(se);
        se.appendChild(stringToNode(divSelectionMany(entryNumber)));
        document.getElementById(`select-many-first-${entryNumber}`).onclick = 
        document.getElementById(`select-many-second-${entryNumber}`).onclick = 
        document.getElementById(`select-many-last-${entryNumber}`).onclick = 
    });
}

// :: HtmlNode -> Int
// PRE: 'selectionEntry' has the structure of the selection entry div
function selectionEntryNumber(selectionEntry) {
    return selectionEntry.firstElementChild.id.split("-").pop();
}

function addSelectionEntry() {
    amountOfEntries += 1;
    entriesStatus.push(false);
    newEntry = (new DOMParser()).parseFromString(selectionHtml(amountOfEntries), 'text/html');
    newEntry.getElementById("select-element-" + amountOfEntries).onclick = selectionListener(amountOfEntries);
    document.getElementById("selector-group").appendChild(newEntry.body.firstChild);
}

function selectionListener(entryNumber) {
    return () => startListening(entryNumber);
}

function injectionListener() {
    return startListening(0);
}

function select(mouseEvent) {
    console.log(this, entriesStatus);
    let entryNumber = listeningEntry();
    if (entryNumber != -1) {
        cleanEntriesStatus();
        if (entryNumber == 0) {
            document.getElementById("injector-xpath-label").textContent =
                createXPathFromElement(mouseEvent.target);
        } else if (entryNumber <= amountOfEntries) {
            let selectionValue = preExtract(mouseEvent.target, entryNumber);
            addSelection(selectionValue, entryNumber);
            document.getElementById(`selector-xpath-label-${entryNumber}`).textContent =
                createXPathFromElement(mouseEvent.target);
        } else {

        }
    }
}

function preExtract(node, entryNumber) {
    console.log("swa-extraction-" + entryNumber);
    const extractionStrategy = document.getElementById("swa-extraction-" + entryNumber).value;
    return extractionStrategies[extractionStrategy](node);
}

function addSelection(selectionValue, entryNumber) {
    // data.push(selection);
    document.getElementById("swa-selection-data-" + entryNumber).value = selectionValue;
}

function selectionHtml(entryNumber) {
    return `
        <div class="selection-entry">
            <input type="button" id="select-element-${entryNumber}" value="Select element">
            <div>
            <label>Role</label>
            <input type="text" name="replacement" id="swa-selection-role-${entryNumber}">
            </div>
            <div>
            <label>Value</label>
            <input type="text" name="replaced" id="swa-selection-data-${entryNumber}">
            </div>
            <label>Data extraction strategy:</label>
            <select id="swa-extraction-${entryNumber}">
                <option>cleaned text content</option>
                <option>text content</option>
                <option>href</option>
            </select>
            <div style="margin:10px">
                <label hidden id="selector-xpath-label-${entryNumber}"></label>
            </div>
        </div>`
}

function divSelectionMany(entryNumber) {
    return `
        <div id="selection-many-div-${entryNumber}">
            <input type="button" id="select-many-second-${entryNumber}" value="2nd el">
            <input type="button" id="select-many-last-${entryNumber}" value="Last el">
            <label hidden id="select-many-second-label-${entryNumber}"></label>
            <label hidden id="select-many-last-label-${entryNumber}"></label>
        </div>`
}