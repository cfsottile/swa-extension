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

function setScripts(doc) {
    doc.getElementById("selector-button").onclick = select("selector");
    doc.getElementById("builder-select").selectedIndex = -1;
    doc.getElementById("builder-select").onchange = adjustBuilderSelection;
    doc.getElementById("injector-button").onclick = select("injector");
    doc.getElementById("augment-button").onclick = preAugment;
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
    "browser-action": onClickedBrowserAction,
    "query-text": processQueryText
}

selectionCallbacks = {
    "selector": getXpath("selector"),
    "injector": getXpath("injector")
}

function select(stage) {
    return () => document.addEventListener("dblclick", selectionCallbacks[stage])
}

function getXpath(stage) {
    return mouseEvent => {
        document.removeEventListener("dblclick", selectionCallbacks[stage]);
        // disable hightlighting
        document.getElementById(stage + "-xpath-label").textContent =
            createXPathFromElement(mouseEvent.target);
    }
} 

function adjustBuilderSelection() {
    switch (document.getElementById("builder-select").value) {
        case "N - N - N":
            renderBuilderInput(1);
            break;
        case "N - M - 1":
            renderBuilderInput(3);
            break;
        // cases "N - M - N" &  "N - N - 1"
        default:
            renderBuilderInput(2);
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

function genSelect() {
    const xpath = document.getElementById("selector-xpath-label").textContent;
    let selection = lookupElementByXPath(xpath);
    if (!document.getElementById("selector-many").checked) {
        selection = [selection];
    }
    return gSelect(() => selection);
}

function genExtract() {
    const extractionStrategy = document.getElementById("extractor-select").value;
    return gExtract(extractionStrategies[extractionStrategy]);
}

function genFetch() {
    const templateQuery = document.getElementById("query").value;
    return gFetch(templateQuery, autoParser(templateQuery));
}

function genBuild() {
    switch (document.getElementById("builder-select").value) {
        case "N - N - N":
            builderInputs = getBuilderInputs(1);
            return gBuildNNN(builderInputs[0]);
        case "N - N - 1":
            builderInputs = getBuilderInputs(2);
            return gBuildNN1(builderInputs[0], builderInputs[1]);
        case "N - M - N":
            builderInputs = getBuilderInputs(2);
            return gBuildNMN(builderInputs[0], builderInputs[1]);
        case "N - M - 1":
            builderInputs = getBuilderInputs(3);
            return gBuildNM1(builderInputs[0], builderInputs[1], builderInputs[2]);
    }
}

function getBuilderInputs(n) {
    let arr = [];
    for (var i = 1; i <= n; i++) {
        arr.push(document.getElementById("building-" + i).value);
    }
    return arr;
}

function genInject() {
    const xpath = document.getElementById("injector-xpath-label").textContent;
    const many = document.getElementById("injector-many").checked;
    const strategy = document.getElementById("injector-select").value;
    if (many) {
        return gInjectN(() => lookupElementByXPath(xpath), injectionStrategies[strategy]);
    } else {
        return gInject1(() => lookupElementByXPath(xpath), injectionStrategies[strategy]);
    }
}

function preAugment() {
    augment(genSelect(), genExtract(), genFetch(), genBuild(), genInject());
}

const extractionStrategies = {
    "text content": (node) => node.textContent,
    "href": (node) => node.href
};

function autoParser(templateQuery) {
    return (data) => {
        const projection = templateQuery.split("where {")[0].match(/\s\?(.*?)\s/g);
        let result = {};
        projection
            .map((e) => e.slice(2, e.length - 1))
            .forEach((e) => result[e] = data.results.bindings[0][e].value);
        return result;
    }
}

const injectionStrategies = {
    "append": (targetNode, nodeToInject) => targetNode.appendChild(nodeToInject)
    // "after": (targetNode, nodeToInject) => targetNode
}

function sidebarHtml() {
    return `
    <div>
    <h3>Semantic Web Augmentation</h3>
    
        <hr>
    
        <div id="selector" style="margin:10px">
          <h3>Selection</h3>
          <div style="margin:10px">
            <input type="button" id="selector-button" value="Select structure">
            <input type="checkbox" id="selector-many"> <label>Many</label>
          </div>
          <div style="margin:10px">
            <label id="selector-xpath-label"></label>
          </div>
        </div>
    
        <hr>
    
        <div id="extractor" style="margin:10px">
          <h3>Extraction</h3>
          <div style="margin:10px">
          <label>Data extraction strategy:</label>
          <select id="extractor-select">
            <option>text content</option>
            <option>href</option>
          </select>
          </div>
        </div>
    
        <hr>
      
        <div id="fetcher" style="margin:10px">
          <h3>Querying</h3>
          <div style="margin:10px">
            <textarea id="query"></textarea>
          </div>
          <a target="_blank" href="http://leipert.github.io/vsb/dbpedia/#/workspace">VSB</a>
        </div>
        
        <hr>
    
        <div id="builder" style="margin:10px">
          <h3>Building</h3>
          <div id="builder-div" style="margin:10px">
            <select id="builder-select">
              <option>N - N - N</option>
              <option>N - N - 1</option>
              <option>N - M - N</option>
              <option>N - M - 1</option>
            </select>
          </div>
        </div>
        
        <hr>
    
        <div id="injector" style="margin:10px">
          <h3>Injection</h3>
          <div style="margin:10px">
            <input type="button" id="injector-button" value="Select node">
            <input type="checkbox" id="injector-many"> <label>Many</label>
            <select id="injector-select">
              <option>append</option>
            </select>
          </div>
          <div style="margin:10px">
            <label id="injector-xpath-label"></label>
          </div>      
        </div>
        
        <hr>
    
        <input type="button" id="augment-button" value="Augment" style="display: block; margin: 0 auto; margin-top: 30px">
        </div>
    `;
}

// code not mine

function createXPathFromElement(elm) { 
    var allNodes = document.getElementsByTagName('*'); 
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) 
    { 
        if (elm.hasAttribute('id')) { 
                var uniqueIdCount = 0; 
                for (var n=0;n < allNodes.length;n++) { 
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++; 
                    if (uniqueIdCount > 1) break; 
                }; 
                if ( uniqueIdCount == 1) { 
                    segs.unshift('id("' + elm.getAttribute('id') + '")'); 
                    return segs.join('/'); 
                } else { 
                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]'); 
                } 
        } else if (elm.hasAttribute('class')) { 
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]'); 
        } else { 
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.localName == elm.localName)  i++; }; 
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']'); 
        }; 
    }; 
    return segs.length ? '/' + segs.join('/') : null; 
}; 

function lookupElementByXPath(path) { 
    var evaluator = new XPathEvaluator(); 
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
    return  result.singleNodeValue; 
} 

// =================================
// ==  augmentation.js  ============
// =================================

// helpers

function updateArtifact(curr,fn,prev) {
    return (artifact) => {
        // console.log("adding", curr, "applying", fn, "to", artifact[prev]);
        artifact[curr] = fn(artifact[prev]);
        return artifact;
    };
}

function getValue(property) {
    return (obj) => {
        return obj[property];
    };
}

function getElementByXpath (path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


// augmentation functions

function augment(select, extract, fetch, build, inject) {
    inject(build(fetch(extract(select()))));
}

// selection functions

function gSelect(parser) {
    return () => {
        return parser().map((element) => { return {"selected": element}; });
    };
}

// extraction functions

// :: (HtmlNode -> [String]) -> ([{"selected": HtmlNode}] -> [{"selected": HtmlNode, "extracted": [String]}])
function gExtract(parser) {
    return function(artifacts) {
        logAugmentationData("gExtract", artifacts);
        return artifacts.map(updateArtifact("extracted",parser,"selected"));
    };
}

// fetching functions

// ::
function gFetch(baseQuery, parser) {
    return function(artifacts) {
        logAugmentationData("gFetch", artifacts);
        return artifacts
            .map(updateArtifact("fetched",query(baseQuery),"extracted"))
            .map(updateArtifact("fetched",parser,"fetched"));
    };
}

function query(base) {
    return function(data) {
        logAugmentationData("query", buildURI(buildQuery(base, data)));
        var xhr = new XMLHttpRequest();
        xhr.open('GET', buildURI(buildQuery(base, data)), false);
        xhr.send();
        return JSON.parse(xhr.responseText);
    };
}

function buildURI(query) {
    return "https://dbpedia.org/sparql?query=" + encodeURIComponent(query) + "&format=json";
}

function buildQuery(base, args) {
    return base.replace(/{{.+?}}/g, args);
}

// building functions

function gBuildNNN(template) {
    return function(artifacts) {
        logAugmentationData("gBuildNNN", artifacts);
        return artifacts.map(updateArtifact("built",fulfillHtml(template),"fetched"));
    };
}

function gBuildNN1(template1,template2) {
    return function(artifacts) {
        logAugmentationData("gBuildNN1", artifacts);
        var tmpArtifacts = gBuildNNN(template1)(artifacts);
        return fulfillHtml(template2)({ "data": nodeToString(fold(tmpArtifacts.map(getValue("built")))) });
    };
}

function gBuildNMN(template1,template2) {
    return function(artifacts) {
        logAugmentationData("gBuildNMN", artifacts);
        var tmpArtifacts = artifacts.map((artifact) => {
            artifact.built = artifact.fetched.map(fulfillHtml(template1));
            return artifact; });
        return tmpArtifacts.map((artifact) => {
            artifact.built = fulfillHtml(template2)({ "data": nodeToString(fold(artifact.built)) });
            return artifact;
        });
    };
}

function gBuildNM1(template1,template2,template3) {
    return function(artifacts) {
        logAugmentationData("gBuildNM1", artifacts);
        var tmpArtifacts = gBuildNMN(template1,template2)(artifacts);
        return fulfillHtml(template3)({ "data": nodeToString(fold(tmpArtifacts.map(getValue("built")))) });
    };
}

function nodeToString(item) {
    var tmp = document.createElement("div");
    tmp.appendChild(item.getElementsByTagName("body")[0].firstChild);
    return tmp.innerHTML;
}

function fulfillHtml(template) {
    return (data) => { return htmlFromString(fulfillTemplate(template, data)); };
}

function fulfillTemplate(template, data) {
    var tmp = template;
    var toFulfill = tmp.match(/{{(.*?)}}/g);
    toFulfill.forEach(function (e, i, a) {
        tmp = tmp.replace(e, data[e.slice(2, e.length - 2)]);
    });
    return tmp;
}

function fold(htmls) {
    return htmls.reduce(
        (total, current) => {
            total.getElementsByTagName("body")[0].firstChild.appendChild(
                current.getElementsByTagName("body")[0].firstChild);
            return total; },
        (new DOMParser()).parseFromString("<div></div>", "text/html"));
}

function htmlFromString(string) {
    return (new DOMParser()).parseFromString(string, "text/html");
}

// injection functions

function gInjectN(nodeGetter, injection) {
    return function(artifacts) {
        logAugmentationData("gInjectN", artifacts);
        artifacts.forEach((artifact) => {
            injection(nodeGetter(artifact), artifact.built.getElementsByTagName("body")[0].firstChild);
        });
    };
}

function gInject1(nodeGetter, injection) {
    return function(builtElement) {
        logAugmentationData("gInject1", builtElement);
        injection(nodeGetter(), builtElement.getElementsByTagName("body")[0].firstChild);
    };
}

function logAugmentationData(stage, artifacts) {
    // console.log(stage);
    // console.log(artifacts);
}