// import {
//     augment, gSelect, gExtract, gFetch, gBuildNN1, gBuildNM1, gBuildNNN, gBuildNMN, gInject1, gInjectN
// } from 'augmentation-core';

// export { preAugment, adjustBuilderSelection };

// type Selection  = HtmlNode
// type Extraction = Map String String
// type Fetching   = Map String String

// selectionEntries :: [HtmlNode]
function selectionEntries() {
    return Array.from(document.getElementsByClassName("selection-entry"));
}

// genSelect :: () -> [Augmentation]
function genSelect() {
    return gSelect(() => selections());
}

// selections :: [Selection]
selections = () => {
    return [selectionEntries()];
}

// genExtract :: [Augmentation] -> [Augmentation]
function genExtract() {
    return gExtract(extractionStrats());
}

// extractorOf :: Selection -> () -> Extraction
function extractorOf(selectionNode) {
    let i = selectionNode.firstElementChild.id.split("-")[2];
    return () => {
        return {
        role: document.getElementById(`swa-selection-role-${i}`).value,
        data: document.getElementById(`swa-selection-data-${i}`).value}
    }
}

// genFetch :: 
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
    const xpath = document.getElementById("injector-xpath-label-1").textContent;
    const many = document.getElementById("injector-many").checked;
    const strategy = document.getElementById("injector-select").value;
    if (many) {
        let samples = [document.getElementById('injector-xpath-label-1').textContent, document.getElementById('injector-xpath-label-2').textContent];
        let elements = elementsFromXpaths(xPathsFromSamples(samples));
        console.log(elements);
        return gInjectN((artifact, i) => elements[i], injectionStrategies[strategy]);
    } else {
        return gInject1(() => lookupElementByXPath(xpath), injectionStrategies[strategy]);
    }
}

function preAugment() {
    // augment(genSelect(), genExtract(), genFetch(), genBuild(), genInject());
    // let selectionType = SelectionEntrySingle;
    // selections = select(selectionType.gather())
    // console.log("Selection");
    // extractions = extraction(gatherExtractors(), selections);
    // console.log()
}

const extractionStrategies = {
    "text content": (node) => node.textContent,
    "cleaned text content": (node) => node.textContent.trim(),
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

// :: String -> String -> [String]
// POST: Resulting list has two elements.
// PRE: args are equal except for some non-side located substring.
function subs(xs,ys) {
    return [untilDiff(xs,ys), fromDiff(xs,ys)]
}

function untilDiff(xs, ys) {
    return untilDiffR(xs,ys).join("")
}

function untilDiffR([x, ...xs], [y, ...ys]) {
    if (x === y) {
        return [x, ...(untilDiff(xs,ys))]
    } else {
        return []
    }
}

function fromDiff(xs,ys) {
    return reverseStr(untilDiff(reverseStr(xs),reverseStr(ys)))
}

function reverseStr(str) { return str.split("").reverse().join("") }

function steppedRange(from, to, step) {
    let arr = [];
    for (var i = from; i <= to; i = i + step) {
        arr.push(i)
    }
    return arr;
}

// Computes the numbers where xpaths differs
function nums(xpaths) {
    let [prefix, suffix] = subs(xpaths[0], xpaths[1]);
    return xpaths.map((xpath) => xpath.substring(prefix.length, xpath.length - suffix.length));
}

function xPathsFromSamples(samples) {
    let [from, to] = nums(samples).map(str => parseInt(str));
    let indexes = steppedRange(from, to, 1);
    let baseXpath = subs(samples[0], samples[1]);
    return indexes.map(i => baseXpath.join(i));
}

function elementsFromXpaths(xpaths) {
    console.log(xpaths.map(x => lookupElementByXPath(x)));
    return xpaths.map(x => lookupElementByXPath(x));
}

function updateManySelectionsFunc() {
    selections = selectionsMany;
}

function rollbackManySelectionsFunc() {
    selections = selectionsSingle;
}

function inferRemainingMany(selectionEntry) {
    let xpaths = Array.from(selectionEntry.querySelectorAll(".selector-xpath-label")).map(e => e.textContent)
    return elementsFromXpaths(xPathsFromSamples(xpaths));
}

function extractionStrategyOf(selectionEntry) {
    return selectionEntry.querySelector(".swa-extraction");
}

function selectionsSingle() {
    return selectionEntries().map(se => lookupElementByXPath(se.querySelector(".selector-xpath-label").textContent));
}

function selectionsMany() {
    return selectionEntries().map(inferRemainingMany);
}

function extractionStrats() {
    return selectionEntries().map(se => extractionStrategies[extractionStrategyOf(se).value]);
}