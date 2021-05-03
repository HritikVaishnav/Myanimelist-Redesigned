var docElem = document.documentElement;
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

chrome.storage.local.get(["enabled","darkMode","mal_redesigned_iframe"],function(response){
    if(response.enabled){
        // darkModeCss
        response.darkMode ? docElem.classList.add('darkMode') : null;

        var style = response.mal_redesigned_iframe;
        iframeCss.appendChild(document.createTextNode(style));
    }
});