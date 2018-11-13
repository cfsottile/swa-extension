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
            <label id="injector-xpath-label"></label>
            </div>      
        </div>
        
        <hr>
    
        <input type="button" id="augment-button" value="Augment" style="display: block; margin: 0 auto; margin-top: 30px">
        </div>
    `;
}