// Punto de partida: [Data], con Data = Map String String

function buildMap(itemTemplate) {
    return (datas) => 
        datas.map(d => stringToNode(fulfillTemplate(itemTemplate, d)));
}

function buildConvergence(itemTemplate, containerTemplate) {
    return (datas) => {
        let itemsStr = datas.map(d => fulfillTemplate(itemTemplate, d)).join("\n");
        return stringToNode(fulfillTemplate(containerTemplate, {items: itemsStr}));
    }
}


// function gatherTemplatesMap() {
//     return 
// }

// function gatherItemTemplate() {
//     return document.querySelector("#building-1");
// }

// function gatherContainerTemplate() {
//     return document.querySelector("#building-2");
// }

// Injection

function inject(targets, injectionStrategy) {
    return (builts) => zipWith(injectionStrategy, targets, builts);
}

const injectionStrategies = {
    "append": (target, toInject) => target.appendChild(toInject)
    // "after": (targetNode, nodeToInject) => targetNode
}

function gatherTargets() {
    // ... Estrategia similar a inferXpaths
}

function gatherInjectionStrategy() {
    return injectionStrategies[document.querySelector("#injector-select").value];
}

// Final

function augment(s,e,f,b,i) {
    return i(b(f(e(s()))));
}

// UI

function preAugment() {
    augment(
        preSelect(),
        preExtract(),
        preFetch(),
        preBuild(),
        preInject()
    )
}

const preSelect  = () => select(selectionType.gather());
const preExtract = () => extract(gatherExtractors());
const preFetch   = () => fetch(document.getElementById("query").value);
let preBuild;
const preInject  = () => inject(gatherTargets(), gatherInjectionStrategy());

const preBuildMap()         => buildMap(gatherItemTemplate());
const preBuildConvergence() => buildConvergence(gatherItemTemplate(), gatherContainerTemplate());