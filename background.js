const baseURL = {
    server1 : "https://projectredesign.herokuapp.com/mal/",
    server2 : "https://projectredesign2.herokuapp.com/mal/",
    checkVersionBackup : "https://projectredesign2.herokuapp.com/versionCheckLink"
};

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
        version: 1.3,
        checkVersion: "https://dl.dropbox.com/s/p7y6xnq82czdih5/update_info.json?dl=0",
        extra_script: null,
        menu_html: null
    });

    xhttpGet(curl('css/minified/mal_redesigned.min.css'),function(res){
        set({mal_redesigned:res})
    });
    xhttpGet(curl('css/minified/mal_redesigned_end.min.css'),function(res){
        set({mal_redesigned_end:res})
    });
    xhttpGet(curl('css/minified/mal_redesigned_iframe.min.css'),function(res){
        set({mal_redesigned_iframe:res})
    });

    // check update on install
    fetchLatestFiles();
})

chrome.runtime.onStartup.addListener(function(){
    fetchLatestFiles();
})

chrome.runtime.onMessage.addListener(function(message){
    if(message === "checkForUpdate"){
        fetchLatestFiles();
    }
    else if(message === "toggleAds"){
        chrome.tabs.query({currentWindow:true},function(tabs){
            for(var i=0; i<tabs.length; i++){
                chrome.tabs.executeScript(tabs[i].id,{
                    file : "/javascript/mal_ads.js"
                });
            }
        })
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
    console.log('checking for latest files');
    get(['version','last_checked','checkVersion'],function(res){
        var current_time = new Date().getHours();
        var current_ver = res.version;
        var checkLink = res.checkVersion;
        if(current_time !== res.last_checked){
            set({last_checked:current_time});
            checkLatestVersion(checkLink,current_ver);
        }
        else{
            console.log('checked recently, no update avaliable')
        }
    });

    function checkLatestVersion(link,current){
        xhttpGet(link,function(res){
            if(res){
                if(res.mal > current){
                    getUpdate(current);   
                }
                else{
                    console.log('already latest')
                }
            }
            else{
                console.log('server error, will try again later');
                xhttpGet(baseURL.checkVersionBackup,function(res){
                    if(res){
                        set({checkVersion:res.link})
                    }
                },'json');
            }
        },'json')
    }

    function getUpdate(current_ver){
        function toDo(res){
            var main = res.main;
            var main_end = res.main_end;
            var iframe = res.iframe;
            var script = res.script;
            var menu = res.menu;
            
            if(main.toUpdate) set({mal_redesigned:main.data});
            if(main_end.toUpdate) set({mal_redesigned_end:main_end.data});
            if(iframe.toUpdate) set({mal_redesigned_iframe:iframe.data});
            script.toUpdate ? set({extra_script:script.data}) : set({extra_script:null});
            menu.toUpdate ? set({menu_html:menu.data}) : set({menu_html:null});
            
            console.log('files updated to latest version');
        }

        xhttpGet(baseURL.server1+"getUpdate", function(res){
            if(res){
                if(res.version > current_ver){
                    set({version:res.version});
                    toDo(res);
                }
                else console.log('already latest');
            }
            else{
                xhttpGet(baseURL.server2+"getUpdate", function(res){
                    if(res){
                        if(res.version > current_ver){
                            set({version:res.version});
                            toDo(res);
                        }
                        else console.log('already latest');
                    }
                    else{
                        console.log('server error, will try again later');
                    }
                },'json')
            }
        },'json')
    }
}
