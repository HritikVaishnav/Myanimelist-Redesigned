// set to chrome storage
function set(toset) {
    chrome.storage.local.set(toset);    
}

// get from chrome storage
function get(toget,callback) {
    chrome.storage.local.get(toget,function(res){
      callback(res);
    });
}

// get extension resource url
function curl(path){
    return chrome.runtime.getURL(path);
}

// setting up extention on installation
chrome.runtime.onInstalled.addListener(function(){
    // clearing chrome storage
    chrome.storage.local.clear();

    // fetching and storing minified css to chrome storage
    getData('css/minified/mal_redesigned.min.css', (data) => {
        set({mal_redesigned:data})
    });
    getData('css/minified/mal_color_template.min.css', (data) => {
        set({mal_color_template:data})
    });
    getData('css/minified/mal_redesigned_iframe.min.css', (data) => {
        set({mal_redesigned_iframe:data})
    });
    getData('css/minified/malr_slider.min.css', (data) => {
        set({malr_slider:data})
    });
    getData('css/minified/malr_tabs.min.css', (data) => {
        set({malr_tabs:data})
    });
    getData('css/minified/malr_menu.min.css', (data) => {
        set({malr_menu:data})
    });
    getData('css/minified/malr_animanga.min.css', (data) => {
        set({animanga_css:data})
    });
    // themes
    getData('css/minified/dark.min.css', (data) => {
        set({"dark":data})
    });
    getData('css/minified/blackpearl.min.css', (data) => {
        set({"blackpearl":data})
    });
    getData('css/minified/creamy.min.css', (data) => {
        set({"creamy":data})
    });
    
    console.log("extention is successfully installed");
})

function getData(url, callback) {
    fetch(curl(url))
        .then(res => res.text())
        .then(textData => callback(textData))
        .catch(err => console.error(err))
}
