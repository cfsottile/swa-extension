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
    doc.getElementById("selector-button").onclick = select;
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

var ops = {
    "browser-action": onClickedBrowserAction,
}

function select() {
    console.log("select");
    // habilitar el highlight
    document.addEventListener("dblclick", getXpath);
}

function getXpath(mouseEvent) {
    document.removeEventListener("dblclick", getXpath);
    // deshabilitar el hightlight
    document.getElementById("selector-xpath-label").textContent = createXPathFromElement(mouseEvent.target);
}

function preAugment(args) {
    let selection = document.getElementById("selector-xpath").value;
    if (!document.getElementById("selector-many").value) {
        selection = [selection];
    }
    let select = gSelect(() => selection);
    
    let extractionStrategy = document.getElementById("extractor-select").value;
    let extract = gExtract(extractionStrategies[extractionStrategy]);
    
    let templateQuery = document.getElementById("query").value;
    let fetch = gFetch(templateQuery, autoParser(templateQuery));
    
    // ...
    
    // augment(select, extract, fetch, build, inject);

    return true;
}

extractionStrategies = {
    "textContent": (node) => node.textContent,
    "href": (node) => node.href
};

function autoParser(templateQuery) {
    return (data) => {
        let projection = templateQuery.match(/\s\?(.*?)\s/g);
        let result = {};
        projection
            .map((e) => e.slice(2, e.length - 1))
            .forEach((e) => result[e] = data.results.bindings[0][e].value);
        return result;
    }
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
        </div>
        
        <hr>
    
        <div id="builder" style="margin:10px">
          <h3>Building</h3>
          <div style="margin:10px">
            <textarea></textarea>
          </div>
        </div>
        
        <hr>
    
        <div id="injector" style="margin:10px">
          <h3>Injection</h3>
          <div style="margin:10px">
            <input type="button" id="injector-button" value="Select node" onclick="select()">
            <select>
              <option>insert after</option>
              <option>insert before</option>
            </select>
          </div>
          <div style="margin:10px">
            <input type="text" id="selector-xpath" disabled>
          </div>      
        </div>
        
        <hr>
    
        <input type="button" value="Augment" style="display: block; margin: 0 auto; margin-top: 30px">
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