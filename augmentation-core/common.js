function lookupElementByXPath(path) { 
    var evaluator = new XPathEvaluator(); 
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
    return  result.singleNodeValue; 
}

function fulfillTemplate(template, data) {
    let tmp = template;
    let toFulfill = tmp.match(/{{(.*?)}}/g);
    toFulfill.forEach(function (e, i, a) {
        tmp = tmp.replace(e, data[e.slice(2, e.length - 2)]);
    });
    return tmp;
}

// ----------------- //
//  XPath Inference  //
// ----------------- //

function inferXpaths([x1,x2]) {
    let [from, to] = nums(x1,x2);
    let indexes = steppedRange(from, to, 1);
    let genericXpath = subs(x1,x2);
    return indexes.map(i => genericXpath.join(i));
}

// Computes the numbers where xpaths differs
function nums(x1, x2) {
    let [prefix, suffix] = subs(x1, x2);
    return [x1,x2].map((xpath) => parseInt(xpath.substring(prefix.length, xpath.length - suffix.length)));
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