// import { toogleSidebar, setData } from 'sidebar-handler';

function onClickedBrowserAction() {
    console.log("Attempting toggling of browser action");
    toogleSidebar();
}

browser.runtime.onMessage.addListener(request => {
    console.log(request);
    // return Promise.resolve({response: run(request.codop, request.args)});
    run(request);
});

function run(request) {
    fn = ops[request.codop];
    if (fn !== undefined) {
        fn(request.args);
    } else {
        console.log("Message not understood");
    }
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

function getXpath(stage) {
    return mouseEvent => {
        document.removeEventListener("dblclick", selectionCallbacks[stage]);
        // disable hightlighting
        setData(preExtract(mouseEvent.target));
        document.getElementById(stage + "-xpath-label").textContent =
            createXPathFromElement(mouseEvent.target);
    }
} 

function preExtract(node) {
    const extractionStrategy = document.getElementById("extractor-select").value;
    return extractionStrategies[extractionStrategy](node);
}

// extern helper

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