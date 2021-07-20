var style = document.getElementById("mal_ads_css");
document.documentElement.classList.toggle('ads-disabled');
if(localStorage.malr_ads === 'false'){
    style.sheet.insertRule("#tbl-next-up,.mal-ad-unit,.amazon-ads,.ad-sas{display:none !important}");
}
else{
    style.sheet.deleteRule(0);
}
