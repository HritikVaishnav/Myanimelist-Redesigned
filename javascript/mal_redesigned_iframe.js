const docElem = document.documentElement;

// checking if extension is enabled
if(localStorage.malr_enabled !== 'false'){
    var iframeCss = document.createElement('style');
    var docHead = document.head;
    if(!docHead){
        const observer = new MutationObserver(function(mutations,observer){
            for(var i=0; i<mutations.length; i++){
                var node = mutations[i].addedNodes[0];
                if(node && node.tagName === 'HEAD'){
                    node.insertAdjacentElement('afterend',iframeCss);
                    observer.disconnect();
                    break;
                }
            }
        });
        observer.observe(docElem,{childList:true});
    }
    else{
        docHead.insertAdjacentElement('afterend',iframeCss);
    }

    // darkModeCss
    localStorage.malr_dark !== 'false' ? docElem.classList.add('darkMode') : null;

    // fetching and appending css
    chrome.storage.local.get(["mal_redesigned_iframe"],function(response){
        let style = response.mal_redesigned_iframe;
        iframeCss.appendChild(document.createTextNode(style));
    });
}