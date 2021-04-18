function onDomLoad(callback){
    if(document.readyState !== "loading") callback()
    else window.addEventListener('DOMContentLoaded',callback)
}

// html component addition
chrome.storage.local.get("menu_html",function(res){
    if(res.menu_html !== null){
        onDomLoad(function(){
            var options = document.getElementsByClassName('options')[0];
            options.insertAdjacentHTML('afterend',res.menu_html);
        })
    }
});

// fetching extention info
var extStatus;
var ads;
chrome.storage.local.get(["enabled","ads"],function(response){
    extStatus = response.enabled;
    ads = response.ads;
    if(extStatus) document.body.id="extensionEnabled";
    else document.body.id="extensionDisabled";
    
    if(ads) document.body.classList.add("adsEnabled");
});


// funtion to toggle extention
function toggleExtension(){
    if(extStatus){
        chrome.storage.local.set({enabled:false});
        chrome.browserAction.setIcon({path:"../images/main-logo-disabled.png"});
        document.body.id="extensionDisabled";
        extStatus = false;
    }
    else{
        chrome.storage.local.set({enabled:true});
        chrome.browserAction.setIcon({path:"../images/main-logo.png"});
        document.body.id="extensionEnabled";
        extStatus = true;
    }
}

function toggleAds(){
    if(ads){
        chrome.storage.local.set({ads:false});
        document.body.classList.remove('adsEnabled');
        ads = false;
    }
    else{
        chrome.storage.local.set({ads:true});
        document.body.classList.add('adsEnabled');
        ads = true;
    }
    chrome.runtime.sendMessage("toggleAds");
}

// to-do after DOM loaded
onDomLoad(function(){
    var toggleExtBtn = document.getElementById('setting');
    var toggleAdsBtn = document.getElementById('ads');
    toggleExtBtn.onclick = toggleExtension;
    toggleAdsBtn.onclick = toggleAds;

    var contribute = document.getElementById("contribute").firstElementChild;
    contribute.onclick = function(){
        window.open("https://www.paypal.com/paypalme/HritikMaster");
    }
})
