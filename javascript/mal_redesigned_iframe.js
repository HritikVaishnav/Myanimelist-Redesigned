var docElem = document.documentElement;
chrome.storage.local.get(["enabled","mal_redesigned_iframe"],function(response){
    if(response.enabled){
        var temp = document.createElement('style');
        var style = response.mal_redesigned_iframe;
        temp.innerHTML = style;
        docElem.insertBefore(temp,docElem.head);
    }
});