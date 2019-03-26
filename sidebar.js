// export { sidebarHtml };

function sidebarHtml() {
    return `
    <div style="font-family:helvetica">
        <h1 style="text-align:center">Semantic Web Augmentation</h1>
        <hr>
    
        <div id="selector" class="selection-stage" style="margin:10px">
            <h2 class="selection-stage">Selection and Extraction</h2>
            <div style="margin:10px" id="selector-group" class="selection-stage">
                <input type="button" id="selector-add" value="Add selection" class="selection-stage">
                <input type="checkbox" id="selector-many"> <span class="selection-stage">Many</span>
            </div>
            <div style="text-align:center; margin-top:20px">
                <input type="button" id="selector-next" value="Next" class="next-button">
            </div>
        </div>
        
        <div id="fetcher" style="margin:10px" class="querying-stage">
            <h2 class="querying-stage">Querying</h2>
            <div style="margin:10px" class="querying-stage">
            <textarea id="query" class="querying-stage" style="margin: 0px; width: 303px; height: 170px;"></textarea>
            </div>
            <input id="vsb-button" type="button" value="Visual SPARQL Builder" class="querying-stage">
            <div style="text-align:center; margin-top:20px">
                <input type="button" id="selector-previous" value="Previous" class="querying-stage previous-button">
                <input type="button" id="selector-next" value="Next" class="querying-stage next-button">
            </div>
        </div>
    
        <div id="builder" style="margin:10px" class="building-stage">
            <h2 class="building-stage">Building</h2>
            <div style="margin:10px">
                <div id="builder-div" class="building-stage">
                    <div style="margin-bottom:5px">Strategy</div>
                    <select id="builder-select" class="building-stage">
                        <option class="building-stage">Map</option>
                        <option class="building-stage">Converge</option>
                    </select>
                </div>
                <div style="margin-top:15px">`+
                    //<span>Available values</span>
                    //<div style="text-align:center; margin-top:5px; margin-bottom:12px">
                    //    <input type="button" value="Person">
                    //    <input type="button" value="Person_Label">
                    //</div>
                    `<span>HTML Template</span>
                    <div id="swa-builder-textarea-div">
                        <div id="swa-builder-textarea">
                            <textarea id="building-1" style="margin-top: 2px; width: 304px; height: 91px;"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align:center; margin-top:20px">
                <input type="button" id="selector-previous" value="Previous" class="building-stage previous-button">
                <input type="button" id="selector-next" value="Next" class="building-stage next-button">
            </div>
        </div>
    
        <div id="injector" style="margin:10px" class="injection-stage">
            <h2 class="injection-stage">Injection</h2>
            <div style="margin:10px" class="injection-stage">
                <div class="injection-buttons" style="margin-bottom:15px">
                    <input type="button" id="injector-button" value="Select element" class="injection-stage">
                    <span hidden style="color: #888888; font-size:small; margin-left:15px">✔︎ Selected</span>
                </div>
                <!-- <input type="checkbox" id="injector-many" class="injection-stage"> <span>Many</span> -->
                <div style="margin-bottom:5px">Strategy</div>
                <select id="injector-select" class="injection-stage">
                    <option class="injection-stage">append</option>
                </select>
            </div>
            <div style="margin:10px" class="injection-stage">
                <div class="injection-xpaths">
                    <span hidden id="injector-xpath-span-1" class="injector-xpath"></span>
                </div>
            </div>      
            <div style="text-align:center; margin-top:20px">
                <input type="button" id="selector-previous" value="Previous" class="injection-stage previous-button">
                <input type="button" id="selector-next" value="Next" class="injection-stage next-button">
            </div>
        </div>

        <div id="saver" class="saving-stage" style="margin:10px">
            <h2 class="saving-stage">Saving</h2>
            <div style="margin:10px">
                <div class="saving-stage" style="margin-bottom:5px">Matching pages</div>
                <input type="text" name="matching-pages" id="swa-matching-pages" class="saving-stage" size="25">
            </div>
            <div style="text-align:center; margin-top:20px">
                <input type="button" id="selector-previous" value="Previous" class="saving-stage previous-button">
                <input type="button" id="try-button" class="saving-stage" value="Try">
                <input type="button" id="save-button" class="saving-stage" value="Save">
            </div>
        </div>
    
    </div>
    `;
}

function selectionHtml(entryNumber) {
    return `
        <div class="selection-entry selection-stage">
            <hr>
            <div class="selection-buttons">
                <input type="button" id="select-element-${entryNumber}-1" class="select-element selection-stage" value="Select element">
            </div>
            <div class="selection-stage" style="margin-top:10px">
                <div class="selection-stage">Role</div>
                <input type="text" name="replacement" id="swa-selection-role-${entryNumber}-1" class="swa-selection-role selection-stage">
            </div>
            <div class="selection-stage selection-values" style="margin-top:10px; margin-bottom:10px">
                <div class="selection-stage selection-value-label-1">Value</div>
                <input type="text" name="replaced" id="swa-selection-data-${entryNumber}-1" class="selection-stage selection-value-1">
            </div>
            <span class="selection-stage">Data extraction strategy</span>
            <select id="swa-extraction-${entryNumber}-1" class="swa-extraction selection-stage" style="margin-top:3px">
                <option class="selection-stage">cleaned text content</option>
                <option class="selection-stage">text content</option>
                <option class="selection-stage">href</option>
            </select>
            <div class="selection-stage selection-xpaths" style="margin:10px">
                <span hidden id="selector-xpath-span-${entryNumber}-1" class="selection-xpath-1 selector-xpath-span"></span>
            </div>
        </div>`
}

function buttonSelectionLast(entryNumber) {
    return `<input type="button" id="select-many-last-${entryNumber}" value="Select last element" class="selection-stage">`;
}

function selectionXpathLast(entryNumber) {
    return `<span hidden id="selector-xpath-span-${entryNumber}-2" class="selector-xpath-span selection-xpath-2"></span>`;
}

function valueLastSelection(entryNumber) {
    return `<div style="margin-top:10px">
                <div class="selection-stage selection-value-label-2">Value of last element</div>
                <input type="text" name="replaced" id="swa-selection-data-${entryNumber}-2" class="selection-stage selection-value-2">
            </div>`;
}

function buttonInjectionLast() {
    return `<input type="button" id="inject-many-2" value="Select last node">`;
}

function injectionXpathLast() {
    return `<span hidden id="injector-xpath-span-2" class="injector-xpath"></span>`;
}