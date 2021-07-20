function onDomLoad(callback){
    if(document.readyState !== "loading") callback()
    else window.addEventListener('DOMContentLoaded',callback)
}

// fetching extention info
var extStatus = localStorage.malr_enabled;
extStatus !== 'false' ? document.body.id="extensionEnabled" : document.body.id="extensionDisabled";

// funtion to toggle extention
function toggleExtension(){
    if(extStatus){
        localStorage.malr_enabled = 'false';
        chrome.browserAction.setIcon({path:"../images/main-logo-disabled.png"});
        document.body.id="extensionDisabled";
        extStatus = false;
    }
    else{
        localStorage.malr_enabled = 'true';
        chrome.browserAction.setIcon({path:"../images/main-logo.png"});
        document.body.id="extensionEnabled";
        extStatus = true;
    }
}

// to-do after DOM loaded
onDomLoad(function(){
    var toggleExtBtn = document.getElementById('setting');
    toggleExtBtn.onclick = toggleExtension;

    var contribute = document.getElementById("contribute").firstElementChild;
    contribute.onclick = function(){
        window.open("https://www.paypal.com/paypalme/HritikMaster");
    }
})
