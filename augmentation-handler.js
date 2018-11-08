// import {
//     augment, gSelect, gExtract, gFetch, gBuildNN1, gBuildNM1, gBuildNNN, gBuildNMN, gInject1, gInjectN
// } from 'augmentation-core';

// export { preAugment, adjustBuilderSelection };

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
        let result = {};
        projectionNames(templateQuery.split("WHERE")[0])
            .forEach((e) => result[e] = data.results.bindings[0][e].value);
        return result;
    }
}

// :: String -> [String]
// Denotes the projected variables within the SPARQL query
function projectionNames(query) {
    regex = /\?(.*?)[\s]/g;
    let arr = []
    while (match = regex.exec(query)) arr.push(match[1]);
    return arr;
}

const injectionStrategies = {
    "append": (targetNode, nodeToInject) => targetNode.appendChild(nodeToInject)
    // "after": (targetNode, nodeToInject) => targetNode
}

function lookupElementByXPath(path) { 
    var evaluator = new XPathEvaluator(); 
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
    return  result.singleNodeValue; 
} 