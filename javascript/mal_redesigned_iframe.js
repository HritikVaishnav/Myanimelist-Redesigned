const docElem = document.documentElement;
var flags = {};
let themeName = localStorage.malr_theme+'';
themeName !== 'default' && themeName !== 'undefined' ? flags.customTheme = true : null;

// checking if extension is enabled
if(localStorage.malr_enabled !== 'false'){
    let color_palette = document.createElement('style');
    var iframeCss = document.createElement('style');
    var docHead = document.head;
    if(!docHead){
        const observer = new MutationObserver(function(mutations,observer){
            for(var i=0; i<mutations.length; i++){
                var node = mutations[i].addedNodes[0];
                if(node && node.tagName === 'HEAD'){
                    node.insertAdjacentElement('afterend',iframeCss);
                    flags.customTheme ? node.insertAdjacentElement('afterend',color_palette) : null;
                    observer.disconnect();
                    break;
                }
            }
        });
        observer.observe(docElem,{childList:true});
    }
    else{
        docHead.insertAdjacentElement('afterend',iframeCss);
        flags.customTheme ? docHead.insertAdjacentElement('afterend',color_palette) : null;
    }

    // fetching and appending css
    chrome.storage.local.get(["mal_redesigned_iframe",themeName],function(response){
        iframeCss.appendChild(document.createTextNode(response.mal_redesigned_iframe));
        color_palette.appendChild(document.createTextNode(response[themeName]));
    });
}