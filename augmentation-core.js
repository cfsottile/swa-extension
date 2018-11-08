// =================================
// ==  augmentation.js  ============
// =================================

// export { augment, gSelect, gExtract, gFetch, gBuildNN1, gBuildNM1, gBuildNNN, gBuildNMN, gInject1, gInjectN };

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
    // let uri = "https://dbpedia.org/sparql?query=" + encodeURIComponent(query) + "&format=json";
    let uri = "https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=" + encodeURIComponent(query) + "&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+";
    console.log("URI", uri);
    return uri;
}

function buildQuery(base, value) {
    console.log("VALUE:", value);
    return base.replace(/{{.+?}}/g, value);
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