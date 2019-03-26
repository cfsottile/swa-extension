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
        return [this.el.querySelector(".selection-xpath-1").textContent]
    }
}

class SelectionEntryMultiple extends SelectionEntry {
    xpaths() {
        let baseElems = Array.from(this.el.querySelectorAll(".selector-xpath-span"));
        let baseXpaths = baseElems.map(e => e.textContent);
        return inferXpaths(baseXpaths);
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