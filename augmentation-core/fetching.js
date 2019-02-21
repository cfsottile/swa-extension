// data Data = Map String String

// :: SparqlQuery -> [Extraction] -> [Data]
function fetch(genericQuery) {
    return (exs, digester) => {
        digester = digester || defaultDigester;
        return exs.map(ex => digester(runQuery(instanceQuery(genericQuery, ex))));
    }
}

function instanceQuery(genericQuery, ex) {
    return fulfillTemplate(genericQuery, ex);
}

function runQuery(query) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', buildURI(query), false);
    xhr.send();
    return JSON.parse(xhr.responseText);
}

function defaultDigester(response) {
    let result = {};
    response.head.vars.forEach((e) => result[e] = digestOne(e, response.results.bindings));
    return result;
}

function digestOne(e, bindings) {
    if (bindings.length > 0) {
        return bindings[0][e].value;
    } else {
        return "";
    }
}

function buildURI(query) {
    // let uri = "https://dbpedia.org/sparql?query=" + encodeURIComponent(query) + "&format=json";
    let uri = "https://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=" + encodeURIComponent(query) + "&format=application%2Fsparql-results%2Bjson&CXML_redir_for_subjs=121&CXML_redir_for_hrefs=&timeout=30000&debug=on&run=+Run+Query+";
    console.log("URI", uri);
    return uri;
}

function fulfillTemplate(template, data) {
    let tmp = template;
    let toFulfill = tmp.match(/{{(.*?)}}/g);
    toFulfill.forEach(function (e, i, a) {
        tmp = tmp.replace(e, data[e.slice(2, e.length - 2)]);
    });
    return tmp;
}