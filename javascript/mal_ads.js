var style = document.getElementById("mal_ads_css");
chrome.storage.local.get("ads",function(response){
    document.documentElement.classList.toggle('ads-disabled');
    if(!response.ads){
        style.sheet.insertRule("#tbl-next-up,.mal-ad-unit,.amazon-ads{display:none !important}");
    }
    else{
        style.sheet.deleteRule(0);
    }
})
