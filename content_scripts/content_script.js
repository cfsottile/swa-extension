console.log("loading content");

browser.runtime.onMessage.addListener(request => {
    console.log(request);
    return Promise.resolve({response: run(request.codop, request.args)});
});

function run(codop, args) {
    return ops[codop](args);
}

var ops = {
    "augment": preAugment,
    "select": select
}

function select() {
    // habilitar el highlight
    document.addEventListener("click", getXpath);
}

function getXpath(mouseEvent) {
    document.removeEventListener("click", getXpath);
    // deshabilitar el hightlight
    return createXPathFromElement(mouseEvent.target);
}

function preAugment(args) {
    let selection = args["selector-xpath"];
    if (!args["selector-many"]) {
        selection = [selection];
    }
    let select = gSelect(() => selection);
    
    let extractionStrategy = args["extractor-select"];
    let extract = gExtract(extractionStrategies[extractionStrategy]);
    
    let templateQuery = args["query"];
    let fetch = gFetch(templateQuery, autoParser(templateQuery));
    
    // ...
    
    console.log(args);

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