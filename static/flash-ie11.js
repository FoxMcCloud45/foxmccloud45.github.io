/**
  * Checks if the current browser
  */
function checkES6Support() {
    "use strict";

    if (typeof Symbol == "undefined") return false;
    try {
        eval("class Foo {}");
        eval("var bar = (x) => x+1");
    } catch (e) { return false; }

    return true;
};

function stopIE() {
    document.execCommand('Stop');
}

var ie = (function (){
    if (window.ActiveXObject === undefined) return null; // Not IE.
    if (!window.XMLHttpRequest) return 6;
    if (!document.querySelector) return 7;
    if (!document.addEventListener) return 8;
    if (!window.atob) return 9;
    if (!document.__proto__) return 10;
    return 11;
})();

if(!checkES6Support()) {
    var ie11Container = document.getElementById("container");
    var ie11Error = document.createElement("h1");
    
    ie11Error.id = "ie11ErrorText";
    ie11Error.innerHTML = "Ce navigateur n'est pas pris en charge.";
    ie11Error.className = "errorText";
    ie11Container.appendChild(ie11Error);
    
    if(ie) {
        ie11Error.innerHTML = "Internet Explorer n'est pas pris en charge.";
        
        var ie11Div = document.createElement("div");
        ie11Div.id = "homeDiv";
    
        var ie11Img = new Image();
        ie11Img.id = "homeImage";
        ie11Img.src = "/images/ie11.jpg";
        ie11Div.appendChild(ie11Img);
        
        var ie11ImgSrc = document.createElement("span");
        ie11ImgSrc.id = "homeImageSrc";
        ie11ImgSrc.innerHTML = "(Merryweather Media)";
        ie11Div.appendChild(ie11ImgSrc);
        
        ie11Container.appendChild(ie11Div);
    }
    
    throw new Error("Ce navigateur n'est pas pris en charge.");
}

