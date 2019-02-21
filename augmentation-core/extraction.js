// data Extraction = Map Role String

// Transformation from list same-nature-grouped elements, to list of objects
// representing their data.

// :: (Selection -> Extraction) -> [Selection] -> [Extraction]
function extract(extractors) {
    return (selections) => {
        let preExtractions = zipWith(preExtractionsFromSelection, extractors, selections);
        return transpose(preExtractions).map(e => e.reduce(addAttribute, {}));
    }
}

// :: (HtmlElement -> String) -> Selection -> [Object]
function preExtractionsFromSelection(f, selection) {
    return selection.map(i => preExtractionFromInput(f, i));
}

// :: (HtmlElement -> String) -> Input -> Object
function preExtractionFromInput(f, input) {
    let ex = {}
    ex[input.role] = f(input.el)
    return ex;
}

// Auxiliary functions

const zipWith = (f, xs, ys) => xs.map((n,i) => f(n, ys[i]))
const transpose = m => m[0].map((x,i) => m.map(x => x[i]));

function addAttribute(obj, kv) {
    let k = Object.keys(kv);
    obj[k] = kv[k];
    return obj;
}

/*
    Example Extraction:

    {
        actor: "Marlon Brando",
        character: "Don Vito Corleone",
        film: "The Godfather"
    }
*/

// UI functions

function gatherExtractors() {
    return Array.from(document.querySelectorAll(".swa-extraction"))
        .map(e => extractionStrategies[e.value]);
}

const extractionStrategies = {
    "text content": (node) => node.textContent,
    "cleaned text content": (node) => superTrim(node.textContent),
    "href": (node) => node.href
};

function superTrim(str) {
    return str.replace(/(\r\n|\n|\r)/gm, "").trim();
}