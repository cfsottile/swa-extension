let replace = () => {
    let toBeReplaced = document.getElementById("swa-text-replaced").value;
    let replacement = document.getElementById("swa-text-replacement").value;
    let query = document.getElementById("sparql-query").textContent
    document.getElementById("sparql-query").textContent = query.replace(toBeReplaced, replacement);
}

let sendQuery = () => {
    browser.runtime.sendMessage({query: document.getElementById("sparql-query").textContent})
}

let html = 
    `<div>
        Replace <input type="text" name="replaced" id="swa-text-replaced">
        with <input type="text" name="replacement" id="swa-text-replacement">
        <button type="button" id="swa-btn-replace">Replace</button>
        <button type="button" id="swa-btn-query-ready">Query ready</button>
    </div>`;
let dom = (new DOMParser()).parseFromString(html, 'text/html');
dom.getElementById("swa-btn-replace").onclick = replace;
dom.getElementById("swa-btn-query-ready").onclick = sendQuery;
div = dom.children[0].children[1].children[0];

document.getElementById("sparql-query").parentNode.appendChild(div);
