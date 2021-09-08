function set(toset) {
    chrome.storage.local.set(toset);    
}
function get(toget,callback) {
    chrome.storage.local.get(toget,function(res){
      callback(res);
    });
}
function curl(path){
    return chrome.runtime.getURL(path);
}

// setting up extention on installation
chrome.runtime.onInstalled.addListener(function(){
    // clearing chrome storage
    chrome.storage.local.clear();

    // fetching and storing minified css to chrome storage
    xhttpGet(curl('css/minified/mal_redesigned.min.css'),function(res){
        set({mal_redesigned:res})
    });
    xhttpGet(curl('css/minified/mal_color_template.min.css'),function(res){
        set({mal_color_template:res})
    });
    xhttpGet(curl('css/minified/mal_redesigned_iframe.min.css'),function(res){
        set({mal_redesigned_iframe:res})
    });
    xhttpGet(curl('css/minified/malr_slider.min.css'),function(res){
        set({malr_slider:res})
    });
    xhttpGet(curl('css/minified/malr_tabs.min.css'),function(res){
        set({malr_tabs:res})
    });
    xhttpGet(curl('css/minified/malr_menu.min.css'),function(res){
        set({malr_menu:res})
    });
    xhttpGet(curl('css/minified/malr_animanga.min.css'),function(res){
        set({animanga_css:res})
    });
    // themes
    xhttpGet(curl('css/minified/dark.min.css'),function(res){
        set({"dark":res})
    });
    xhttpGet(curl('css/minified/blackpearl.min.css'),function(res){
        set({"blackpearl":res})
    });
    xhttpGet(curl('css/minified/creamy.min.css'),function(res){
        set({"creamy":res})
    });
    
    console.log("extention is successfully installed");
})

chrome.runtime.onStartup.addListener(function(){
    
})

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    switch (message) {
        case "toggleAds":
            chrome.tabs.query({currentWindow:true},function(tabs){
                for(var i=0; i<tabs.length; i++){
                    chrome.tabs.executeScript(tabs[i].id,{
                        file : "/javascript/mal_ads.js"
                    });
                }
            })
            break;
    
        default:
            break;
    }
})

function xhttpGet(link,callback,type){
    type ? null : type = 'text';
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState === 4){
            if (this.status === 200) {
                callback(this.response);
            }
            else{
                callback(false);
            }
        }
    };
    xhttp.responseType = type;
    xhttp.open("GET", link, true);
    xhttp.send();
}
