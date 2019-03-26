function augment(s,e,f,b,i) {
    return i(b(f(e(s()))));
}

// UI

const preBuildMap         = () => buildMap(gatherItemTemplate());
const preBuildConvergence = () => buildConvergence(gatherItemTemplate(), gatherContainerTemplate());

const preSelect  = () => select(selectionType.gather());
const preExtract = () => extract(gatherExtractors());
const preFetch   = () => fetch(document.getElementById("query").value);
var preBuild = preBuildMap;
const preInject  = () => inject(injectionType.targets(), gatherInjectionStrategy());

function preAugment() {
    augment(
        preSelect(),
        preExtract(),
        preFetch(),
        preBuild(),
        preInject()
    )
}
