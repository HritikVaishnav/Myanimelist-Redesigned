const baseURL = "https://malredesigned.herokuapp.com/";

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
    chrome.storage.local.clear();
    set({
        enabled: true, 
        ads: true,
        last_checked: null, 
        version: 1,
        extra_script: null,
        menu_html: null
    });

    xhttpGet(curl('css/mal_redesigned.css'),function(res){
        set({mal_redesigned:res})
    });
    xhttpGet(curl('css/mal_redesigned_end.css'),function(res){
        set({mal_redesigned_end:res})
    });
    xhttpGet(curl('css/mal_redesigned_iframe.css'),function(res){
        set({mal_redesigned_iframe:res})
    });

    // check update on install
    console.log('checking for update');
    fetchLatestFiles();
})

chrome.runtime.onStartup.addListener(function(){
    fetchLatestFiles();
})

chrome.runtime.onMessage.addListener(function(message){
    if(message === "checkForUpdate"){
        fetchLatestFiles();
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

function fetchLatestFiles(){
    get(['version','last_checked'],function(res){
        var current_time = new Date().getHours();
        var current_ver = res.version;
        if(current_time !== res.last_checked){
            set({last_checked:current_time});
            xhttpGet(baseURL+"checkUpdate", function(res){
                if(res){
                    if(current_ver < res.version){
                        set({version:res.version});
                        toDo(res.checksum);
                    }
                    else{
                        console.log('already latest');
                    }
                }
            },'json');
        }
        else{
            console.log('checked recently, no update avaliable')
        }
    });

    function toDo(checksum){
        xhttpGet(baseURL+"getUpdate", function(res){
            if(res){
                var maincss = res.main;
                var maincss_end = res.main_end;
                var iframe = res.iframe;
                var script = res.script;
                var comp = res.comp;
                
                if(maincss.toUpdate) set({mal_redesigned:maincss.data});
                if(maincss_end.toUpdate) set({mal_redesigned_end:maincss_end.data});
                if(iframe.toUpdate) set({mal_redesigned_iframe:iframe.data});
                script.toUpdate ? set({extra_script:script.data}) : set({extra_script:null});
                comp.toUpdate ? set({menu_html:comp.data}) : set({menu_html:null});
                
                console.log('files updated to latest version');
            }
        },'json')
    }
}
