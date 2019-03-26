// Punto de partida: [Data], con Data = Map String String

function buildMap(itemTemplate) {
    return (datas) => 
        datas.map(d => stringToNode(fulfillTemplate(itemTemplate, d)));
}

function buildConvergence(itemTemplate, containerTemplate) {
    return (datas) => {
        let itemsStr = datas.map(d => fulfillTemplate(itemTemplate, d)).join("\n");
        return [stringToNode(fulfillTemplate(containerTemplate, {items: itemsStr}))];
    }
}


// function gatherTemplatesMap() {
//     return 
// }

function gatherItemTemplate() {
    return document.querySelector("#building-1").value;
}

function gatherContainerTemplate() {
    return document.querySelector("#building-2").value;
}