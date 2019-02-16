// export { sidebarHtml };

function sidebarHtml() {
    return `
    <div>
    <h3>Semantic Web Augmentation</h3>
    
        <hr>
    
        <div id="selector" style="margin:10px">
            <h3>Selection</h3>
            <div style="margin:10px" id="selector-group">
                <input type="button" id="selector-add" value="Add selection">
                <input type="checkbox" id="selector-many"> <label>Many</label>
            </div>
        </div>
    
        <hr>
        
        <div id="fetcher" style="margin:10px">
            <h3>Querying</h3>
            <div style="margin:10px">
            <textarea id="query"></textarea>
            </div>
            <input id="vsb-button" type="button" value="Visual SPARQL Builder">
        </div>
        
        <hr>
    
        <div id="builder" style="margin:10px">
            <h3>Building</h3>
            <div id="builder-div" style="margin:10px">
            <select id="builder-select">
                <option>N - N - N</option>
                <option>N - N - 1</option>
                <option>N - M - N</option>
                <option>N - M - 1</option>
            </select>
            </div>
        </div>
        
        <hr>
    
        <div id="injector" style="margin:10px">
            <h3>Injection</h3>
            <div style="margin:10px">
            <input type="button" id="injector-button" value="Select node">
            <input type="checkbox" id="injector-many"> <label>Many</label>
            <select id="injector-select">
                <option>append</option>
            </select>
            </div>
            <div style="margin:10px">
            <label hidden id="injector-xpath-label-1"></label>
            </div>      
        </div>
        
        <hr>
    
        <input type="button" id="augment-button" value="Augment" style="display: block; margin: 0 auto; margin-top: 30px">
        </div>
    `;
}

function selectionHtml(entryNumber) {
    return `
        <div class="selection-entry">
            <input type="button" id="select-element-${entryNumber}-1" value="Select element">
            <div>
            <label>Role</label>
            <input type="text" name="replacement" id="swa-selection-role-${entryNumber}-1">
            </div>
            <div>
            <label>Value</label>
            <input type="text" name="replaced" id="swa-selection-data-${entryNumber}-1">
            </div>
            <label>Data extraction strategy:</label>
            <select id="swa-extraction-${entryNumber}-1">
                <option>cleaned text content</option>
                <option>text content</option>
                <option>href</option>
            </select>
            <div style="margin:10px">
                <label hidden id="selector-xpath-label-${entryNumber}-1"></label>
            </div>
        </div>`
}

function divSelectionMany(entryNumber) {
    return `
        <div id="selection-many-div-${entryNumber}">
            <input type="button" id="select-many-last-${entryNumber}" value="Last el">
            <label hidden id="selector-xpath-label-${entryNumber}-2"></label>
        </div>`
            // <input type="button" id="select-many-second-${entryNumber}" value="2nd el">
            // <label hidden id="selector-xpath-label-${entryNumber}-3"></label>
}

function divInjectionMany() {
    return `<div>
                <input type="button" id="inject-many-2" value="Last el">
                <label hidden id="injector-xpath-label-2"></label>
            </div>`
            // <input type="button" id="select-many-second-${entryNumber}" value="2nd el">
            // <label hidden id="selector-xpath-label-${entryNumber}-3"></label>
}