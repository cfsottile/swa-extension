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

// extern helper

function createXPathFromElement(element) { 
    if (element.id!=='')
        return 'id("'+element.id+'")';
    if (element===document.body)
        return element.tagName;

    var ix= 0;
    var siblings= element.parentNode.childNodes;
    for (var i= 0; i<siblings.length; i++) {
        var sibling= siblings[i];
        if (sibling===element)
            return createXPathFromElement(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
            ix++;
    }
}; 