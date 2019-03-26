class StageHandler {
    constructor(swaStyles) {
        this.swaStyles = swaStyles;
        this.stages = [new SelectionStage(), new QueryingStage(), new BuildingStage(), new InjectionStage(), new SavingStage()];
        this.currentStage = 0;
        this.stages.forEach(s => s.unload(this.swaStyles));
        this.stages[this.currentStage].load(this.swaStyles);
    }

    next() {
        this.stages[this.currentStage].unload(this.swaStyles);
        this.stages[this.currentStage + 1].load(this.swaStyles);
        this.currentStage = this.currentStage + 1;
    }

    previous() {
        this.stages[this.currentStage].unload(this.swaStyles);
        this.stages[this.currentStage - 1].load(this.swaStyles);
        this.currentStage = this.currentStage - 1;
    }
}

class Stage {
    load(swaStyles) {
        swaStyles.sheet.deleteRule(this.i);
        // document.querySelectorAll(cssStageClass).forEach(e => e.style.display = "")
    }

    unload(swaStyles) {
        swaStyles.sheet.insertRule(`${this.cssStageClass} { display: none }`, this.i);
        // document.querySelectorAll(cssStageClass).forEach(e => e.style.display = "none")
    }
}

class SelectionStage extends Stage {
    constructor() {
        super();
        this.cssStageClass = ".selection-stage";
        this.i = 0;
    }
}

class QueryingStage extends Stage {
    constructor() {
        super();
        this.cssStageClass = ".querying-stage";
        this.i = 1;
    }
}

class BuildingStage extends Stage {
    constructor() {
        super();
        this.cssStageClass = ".building-stage";
        this.i = 2;
    }
}

class InjectionStage extends Stage {
    constructor() {
        super();
        this.cssStageClass = ".injection-stage";
        this.i = 3;
    }
}

class SavingStage extends Stage {
    constructor() {
        super();
        this.cssStageClass = ".saving-stage";
        this.i = 4;
    }
}