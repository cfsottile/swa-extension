class Injection {
    static targets() {
        return this.xpaths().map(x => lookupElementByXPath(x));
    }
}

class InjectionConvergence extends Injection {
    static xpaths() {
        return [document.querySelector(".injector-xpath").textContent]
    }
}

class InjectionMap extends Injection {
    static xpaths() {
        let baseElems = Array.from(document.querySelectorAll(".injector-xpath"));
        let baseXpaths = baseElems.map(e => e.textContent);
        if (baseXpaths.length == 1) {
            return baseXpaths;
        } else {
            return inferXpaths(baseXpaths);
        }
    }
}

// :: [XPath] -> (HtmlElement -> HtmlElement -> IO ()) -> [HtmlElement] -> IO ()
function inject(targets, injectionStrategy) {
    return (builts) => zipWith(injectionStrategy, targets, builts);
}

const injectionStrategies = {
    "append": (target, toInject) => target.appendChild(toInject)
    // "after": (targetNode, nodeToInject) => targetNode
}

function gatherInjectionStrategy() {
    return injectionStrategies[document.querySelector("#injector-select").value];
}