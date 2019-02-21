class SelectionEntry {
    constructor(el) {
        this.el = el;
    }

    role() {
        return this.el.querySelector(".swa-selection-role").value;
    }

    static gather() {
        return this.allSelectionEntries().map(se => new this(se));
    }

    static allSelectionEntries() {
        return Array.from(document.querySelectorAll(".selection-entry"));
    }
}

class SelectionEntrySingle extends SelectionEntry {
    xpaths() {
        return [this.el.querySelector(".selector-xpath-label").textContent]
    }
}

class SelectionEntryMultiple extends SelectionEntry {
    xpaths() {
        let baseElems = Array.from(this.el.querySelectorAll(".selector-xpath-label"));
        let baseXpaths = baseElems.map(e => e.textContent);
        return this.inferXpaths(baseXpaths);
    }

    inferXpaths([x1,x2]) {
        let [from, to] = this.nums(x1,x2);
        let indexes = this.steppedRange(from, to, 1);
        let genericXpath = this.subs(x1,x2);
        return indexes.map(i => genericXpath.join(i));
    }

    // Computes the numbers where xpaths differs
    nums(x1, x2) {
        let [prefix, suffix] = this.subs(x1, x2);
        return [x1,x2].map((xpath) => parseInt(xpath.substring(prefix.length, xpath.length - suffix.length)));
    }

    // :: String -> String -> [String]
    // POST: Resulting list has two elements.
    // PRE: args are equal except for some non-side located substring.
    subs(xs,ys) {
        return [this.untilDiff(xs,ys), this.fromDiff(xs,ys)]
    }

    untilDiff(xs, ys) {
        return this.untilDiffR(xs,ys).join("")
    }

    untilDiffR([x, ...xs], [y, ...ys]) {
        if (x === y) {
            return [x, ...(this.untilDiff(xs,ys))]
        } else {
            return []
        }
    }

    fromDiff(xs,ys) {
        return this.reverseStr(this.untilDiff(this.reverseStr(xs),this.reverseStr(ys)))
    }

    reverseStr(str) { return str.split("").reverse().join("") }

    steppedRange(from, to, step) {
        let arr = [];
        for (var i = from; i <= to; i = i + step) {
            arr.push(i)
        }
        return arr;
    }
}

class Input {
    constructor(role, el) {
        this.role = role;
        this.el = el;
    }

    static fromXpath(xpath, role) {
        return new this(role, lookupElementByXPath(xpath));
    }
}

// data Selection = [Input]

// :: [SelectionEntry] -> DOM -> [Selection]
function select(selectionEntries) {
    return () => selectionEntries.map(takeInput);
}

// :: SelectionEntry -> DOM -> [Input]
function takeInput(selectionEntry) {
    let inputFromXpath = x => Input.fromXpath(x,selectionEntry.role());
    return selectionEntry.xpaths().map(inputFromXpath);
}

/*
    Example Selection:

    [{
        role: "actor",
        el: marlonBrandoEl
    }, {
        role: "actor",
        el: alPacinoEl
    }, {
        role: "actor",
        el: robertDuncanEl
    }]
*/

function lookupElementByXPath(path) { 
    var evaluator = new XPathEvaluator(); 
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
    return  result.singleNodeValue; 
}