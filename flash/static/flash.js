const baseTitle = document.title;
const container = document.getElementById("container");
const defUrl    = "";
const cssClassForLabels = "labelOpt";
const cssClassForCheckboxes = "checkboxOpt";
const cssClassForDivs = "optDiv";

/**
 * Query string settings that are both a Ruffle setting and a setting to show on the UI.
 * 
 * DO NOT USE THIS ARRAY DIRECTLY! These settings are concatenated to the other arrays.
 */
const sharedSettings = [
    //           Label                                                  Name                Default    isConf Possible values
    // Currently empty.
    // Autoplay is "shared" but we use a checkbox between "auto" and "on" so we can't use this.
    // The Autoplay checkbox works because the URL paramater value for checked boxes is "on" by default.
];

/**
 * @typedef {Object} Setting
 * @property {string} name - The name for this setting.
 * @property {string|boolean} defaultValue - The default value for this setting. If null, the setting will not exist if it's not specified.
 * @property {boolean} isConfigurable - Whether this setting is configurable. If false, this means the default value is the only possible setting.
 * @property {Array} possibleValues - The array of the possible values for this setting. If not an array and isConfigurable is true, any value will be accepted.
 */

/**
 * A configuration setting.
 * 
 * @param {string} label - The label text for display in the UI, if it ever is.
 * @param {string} name - The name for this setting. Required.
 * @param {string|boolean} defaultValue - The default value for this setting. If null, the setting will only exist if specified by the user.
 * @param {boolean} isConfigurable - Whether this setting is configurable.
 * @param {Array} possibleValues - The array of the possible values for this setting. If not an array and isConfigurable is true, any value will be accepted.
 * @return {Setting} a new Setting object.
 */
function Setting(label, name, defaultValue, isConfigurable, possibleValues) {
    this.label = label;
    this.name = name;
    this.defaultValue = defaultValue;
    this.isConfigurable = isConfigurable;
    this.possibleValues = possibleValues;
};

/**
 * Parses the query string from the URL and turns it into useable settings.
 * 
 * @param {Setting[]} settings - An array of Setting objects.
 * @return {Object} An object with the setting's name as key and the setting's value as value.
 * @see {@link ruffleUrlParams}
 */
function parseSettings(params) {
    let result = {};
    let url = new URL(window.location.href);
    for(let i = 0; i < params.length; ++i) {
        let currentSetting = params[i];
        let finalValue = currentSetting.defaultValue;
        
        if(result.hasOwnProperty(currentSetting.name)) {
            console.warn("Code error: the setting \"" + currentSetting.name + "\" is duplicated in the definition.");
            continue; // Duplicated setting.
        }
        
        if(currentSetting.isConfigurable) {
            let urlParam = url.searchParams.get(currentSetting.name);
            if(urlParam != null) {
                if(typeof currentSetting.defaultValue === "boolean") {
                    finalValue = (urlParam === "on");
                }
                else if(Array.isArray(currentSetting.possibleValues)) {
                    if(currentSetting.possibleValues.includes(urlParam)) {
                        finalValue = urlParam;
                    }
                }
                else {
                    finalValue = urlParam;
                }
            }
        }
        
        if(finalValue != null) {
            result[currentSetting.name] = finalValue;
        }
    }
    
    return result;
};

/**
 * Creates UI options for the homepage.
 * 
 * Only checkboxes are currently supported.
 * 
 * @param {Object} node - HTML node where the options should be placed.
 * @param {Setting[]} settings - An array of Setting objects that should be configurable from the UI.
 * @param {boolean} createDiv - Whether to create a div for each individual setting.
 */
function makeOptions(node, settings, createDiv) {
    for(let i = 0; i < settings.length; ++i) {
        let currentSetting = settings[i];
        let settingLabel = currentSetting.label;
        
        if(typeof settingLabel === "string" && settingLabel.length > 0) {
            let defaultValue = currentSetting.defaultValue;
            let nodeToUse = node;
            let optionDiv;
            let optionElement;
            if(typeof defaultValue === "boolean") {
                optionElement       = document.createElement("input");
                optionElement.id    = currentSetting.name + "Checkbox";
                optionElement.name  = currentSetting.name;
                optionElement.type  = "checkbox";
                optionElement.value = "on";
                optionElement.className = cssClassForCheckboxes;
                
                if(currentSetting.defaultValue) {
                    optionElement.checked = checked;
                }
                
                if(!currentSetting.isConfigurable) {
                    optionElement.disabled = "disabled";
                    optionElement.readOnly = true;
                }
            }
            else {
                console.warn("Code error: Unsupported option type for makeOptions(): \"" + typeof defaultValue + "\". Ignored.");
                continue;
            }
            
            let optionLabel = document.createElement("label");
            optionLabel.htmlFor   = optionElement.id;
            optionLabel.id        = currentSetting.name + "Label";
            optionLabel.innerHTML = settingLabel;
            optionLabel.className = cssClassForLabels;
            
            if(createDiv) {
                optionDiv    = document.createElement("div");
                optionDiv.id = currentSetting.name + "OptDiv";
                optionDiv.className = cssClassForDivs;
                nodeToUse = optionDiv;
            }
            
            nodeToUse.appendChild(optionLabel);
            nodeToUse.appendChild(optionElement);
            
            if(createDiv) {
                node.appendChild(nodeToUse);
            }
        }
    }
};

/**
 * Returns whether the given urlString is a valid HTTP(S) URL.
 * 
 * @param {string} urlString - The URL string.
 * @return {boolean} Whether the URL is valid.
 */
const isValidUrl = urlString=> {
    try {
        const u = new URL(urlString);
        return u.protocol === "https:" || u.protocol === "http:"; 
    }
    catch(e){ 
        return false; 
    }
};

/**
 * Query string settings used for the Ruffle player.
 * @see {@link Setting}
 */
let ruffleSettings = [
    //           Label                                                  Name                Default    isConf Possible values
    new Setting("Accès réseau",                                        "allowNetworking",   "none",    false, ["all", "internal", "none"]),
    new Setting("Autoriser l'accès à la page",                         "allowScriptAccess", false,     false, null),
    new Setting("AutoPlay",                                            "autoplay",          "auto",    true,  ["auto", "off", "on"]),
    new Setting("Couleur d'arrière-plan",                              "backgroundColor",   "#000000", false, null),
    new Setting("Privilégier Adobe Flash",                             "favorFlash",        false,     false, null),
    new Setting("Letterboxing en plein écran",                         "letterbox",         "off",     false, ["fullscreen", "off", "on"]),
    new Setting("Menu multimédia dans le menu contextuel",             "menu",              true,      true,  null),
    new Setting("Autoriser l'ouverture de liens externes",             "openUrlMode",       "confirm", false, ["allow", "confirm", "deny"]),
    new Setting("Remplacer les embeds Flash",                          "polyfills",         false,     false, null),
    new Setting("Qualité",                                             "quality",           "best",    true,  ["low", "medium", "high", "best"]),
    new Setting("Échelle",                                             "scale",             "showAll", true,  ["showAll", "noborder", "exactfit", "noscale"]),
    new Setting("Autoriser le téléchargement du SWF",                  "showSwfDownload",   true,      false, null),
    new Setting("Montrer l'écran de démarrage",                        "showSplashScreen",  true,      false, null),
    new Setting("Afficher l'indicateur « Cliquer pour jouer le son »", "unmuteOverlay",     "hidden",  true,  ["visible", "hidden"] ),
    new Setting("",                                                    "url",               defUrl,    true,  null),
];

let uiSettings = [
    //           Label                                                  Name                Default    isConf Possible values
    new Setting("Ajuster à l'écran",                                   "fit",               false,     true,  null),
    new Setting("Forcer l'AutoPlay",                                   "autoplay",          false,     true,  null),
];

// Concatenates both arrays.
ruffleSettings.push.apply(ruffleSettings, sharedSettings);
uiSettings.push.apply(uiSettings, sharedSettings);

let ruffleConfig = parseSettings(ruffleSettings);
let customConfig = parseSettings(uiSettings);

let swf = defUrl;
if(Object.hasOwn(ruffleConfig, "url")) {
    swf = ruffleConfig.url;
}

if(isValidUrl(swf)) {
    window.RufflePlayer = window.RufflePlayer || {};
    window.addEventListener("load", (event) => {
        const ruffle = window.RufflePlayer.newest();
        const player = ruffle.createPlayer();
        
        /* Fits player to screen. We always do it because we want the player
         * to scale down if the window is smaller than the movie.
         * 
         * The 'Fit' option is for scaling UP the movie if the screen is
         * larger. If disabled, we don't do that scaling up, and that's
         * configured in CSS later.
         */
        player.style.width = "100vw";
        player.style.height = "100vh";
        
        container.appendChild(player);
        player.addEventListener('loadedmetadata', () => {
            let newTitle = swf.substring(swf.lastIndexOf('/')+1);
            if(newTitle !== "") {
                document.title = newTitle + " - " + baseTitle;
            }
            if(customConfig.fit) {
                // Default behavior is "Fit to screen". We just remove the scrollbars.
                document.body.style.overflow = "hidden";
            }
            else {
                // 'Fit' is disabled: prevent the player from getting larger than the movie.
                player.style.maxWidth = "" + player.metadata.width + "px";
                player.style.maxHeight = "" + player.metadata.height + "px";
            }
        });
        player.load(ruffleConfig).then(() => {
            // Do nothing, there's no true success until the file's metadata is loaded.
        }).catch((e) => {
            document.title = "Erreur - " + baseTitle;
            console.error(e);
            let epicFail = document.createElement("h1");
            epicFail.id        = "ruffleError";
            epicFail.innerHTML = "Une erreur est survenue pendant le chargement du lecteur.";
            epicFail.className = "errorText";
            container.insertBefore(epicFail, container.firstChild);
        });
    });
}
else {
    if(swf === defUrl) {
        let title    = document.createElement("h1");
        let urlForm  = document.createElement("form");
        let urlAbDiv = document.createElement("div");
        let urlLabel = document.createElement("label");
        let urlDiv   = document.createElement("div");
        let urlInput = document.createElement("input");
        let urlBttn  = document.createElement("input");
        let urlOpts  = document.createElement("div");
        let urlRem   = document.createElement("p");
        //let urlRem2  = document.createElement("p");
        
        let autoPlayOpt = document.createElement("input");
        let fitOpt = document.createElement("input");
        
        makeOptions(urlOpts, uiSettings, true);

        title.id = "title";
        title.innerHTML = "Lecteur Flash Ruffle du tiers-monde";
        
        urlForm.method = "GET";
        
        urlAbDiv.id = "urlAbDiv";
        
        urlLabel.htmlFor = "urlInput";
        urlLabel.id = "urlLabel";
        urlLabel.innerHTML = "URL vers un fichier Flash SWF";
        urlLabel.className = cssClassForLabels;
        
        urlDiv.className = "urlFormDivs";
        urlDiv.id = "urlDiv";
        
        urlInput.name = "url";
        urlInput.id = urlLabel.htmlFor;
        urlInput.placeholder = "https://example.org/issou.swf"
        urlInput.type = "text";
        
        urlBttn.id = "urlBttn";
        urlBttn.value = "►";
        urlBttn.type  = "submit";
        
        urlOpts.className = "urlFormDivs";
        urlOpts.id = "urlOpts";
        
        urlRem.innerHTML  = "Remarque : Le serveur distant doit autoriser le « partage des ressources entre origines multiples » (CORS), ce qui n'est souvent pas le cas. <a href=\"https://catbox.moe/\">Catbox.moe</a> le fait.";
        //urlRem2.innerHTML = "Attention : Si vous utilisez les <a href=\"https://quad9.net/\">DNS Quad9</a> sécurisés, <a href=\"https://quad9.net/result?url=files.catbox.moe\">l'hôte files.catbox.moe est actuellement bloqué</a>.";
        
        urlDiv.appendChild(urlInput);
        urlDiv.appendChild(urlBttn);
        urlAbDiv.appendChild(urlLabel);
        urlForm.appendChild(urlAbDiv);
        urlForm.appendChild(urlDiv);
        urlForm.appendChild(urlOpts);
        container.appendChild(title);
        container.appendChild(urlForm);
        container.appendChild(urlRem);
        //container.appendChild(urlRem2);
    }
    else {
        let urlError = document.createElement("h1");
        urlError.id = "urlErrorText";
        urlError.innerHTML = "URL invalide.";
        urlError.className = "errorText";
        container.appendChild(urlError);
    }
}
