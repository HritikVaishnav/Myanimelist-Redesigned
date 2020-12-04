var body;
var rThis = this;
var docElem = document.documentElement;
var userList = false;
const observer = new Mutate([false,true,true]);
const observer2 = new Mutate([false,true,false]);

// inserting style tag
var mal_redesigned = document.createElement('style');
var docHead = document.head;
if(!docHead){
    observer2.start(docElem,function(mutation){
        var node = mutation.addedNodes[0];
        if(node && node.tagName === 'HEAD'){
            node.insertAdjacentElement('afterend',mal_redesigned);
            observer2.stop();
            return true;
        }
    })   
}
else{
    docHead.insertAdjacentElement('afterend',mal_redesigned);
}

function MainTableIdentity(id){
    observer.start(docElem,function(mutation){
        var node = mutation.addedNodes[0];
        if(node && node.tagName === 'TABLE'){
            node.id = id;
            observer.stop();
            return true;
        }
    });
}

// identifying page type
var pageURL = document.URL.split(/[/?]/);
switch (pageURL[3]) {
    case 'animelist':
        userList = true;
        break;
    case 'anime':
        docElem.id = "animePage";
        MainTableIdentity("MainTable");
        if(pageURL[6]) docElem.className = 'animeTabs';
        break;
    case 'manga':
        docElem.id = "mangaPage";
        MainTableIdentity("MainTable");
        break;
    case 'character':
        docElem.id = "characterPage";
        MainTableIdentity("MainTable");
        break;
    case 'people':
        docElem.id = "peoplePage";
        MainTableIdentity("MainTable");
        break;
    case 'forum':
        docElem.id = "forumPage";
        break;
    case 'featured':
        docElem.id = "featuredPage";
        break;
    case 'addtolist.php':
        docElem.id = "quickaddPage";
        break;
    case 'users.php':
        docElem.id = "usersPage";
        MainTableIdentity("UsersMainTable");
        break;
    case 'people.php':
        docElem.id = "peopleListPage";
        break;
    case 'profile':
        if(pageURL[5]){
            docElem.id = "profileTabs";
            switch (pageURL[5]) {
                case 'recommendations':
                    docElem.className = 'recommendations'
                    break;
                default:
                    MainTableIdentity("MainTable");
                    break;
            }
        }
        break;
    case 'recommendations.php':
        docElem.id = "recommendationsPage";
        break;
    case 'clubs.php':
        docElem.id = "clubsPage";
        if(pageURL[4]){
            if (pageURL[4].search("cid=") >= 0)
              MainTableIdentity("clubsMainTable");
            else if (pageURL[4].search("t=pictures") >= 0)
              docElem.className = "clubPictures";
            else if (pageURL[4].search("t=members") >= 0)
              docElem.className = "clubMembers";
        }
        break;    
    case 'shared.php':
        docElem.id = "sharedPage";
        break;        
    case 'editprofile.php':
        docElem.id = "editprofilePage";
        break;        
    case 'about.php':
        if(pageURL[4]){
            if(pageURL[4].search("=team") >= 0){
                docElem.id = "staffPage";
            }
        }
        break;        
    default:
        if(!pageURL[3])
            docElem.id = "homePage";
        break;
}

chrome.storage.local.get(['enabled','ads','mal_redesigned'],function (response){
    if((response.enabled && !userList)){
        mal_redesigned.appendChild(document.createTextNode(response.mal_redesigned));

        // ads css
        var mal_ads = document.createElement('style');
        mal_ads.id = "mal_ads_css";
        mal_redesigned.insertAdjacentElement('afterend',mal_ads);
        if(!response.ads){
            var css = "#tbl-next-up,.mal-ad-unit,.amazon-ads{display:none !important}";
            mal_ads.appendChild(document.createTextNode(css));
        }

        // on DOM loaded
        onDomLoad(function(){
            script(response);
        })
    }
    else{
        console.log('extention disabled')
    }
});

function script(response){
    body = document.body;
    var navbar = $id('headerSmall');
    var menu = $id('menu');
    
    $onscroll({
        scrolldown:function(scroll_y){
            //scrolling-down
            if(!navbar.onscrollstate){
                // if(scroll_y > 10){
                    navbar.classList.add('onscroll');
                    menu.classList.add('onscroll');
                    navbar.onscrollstate = true;
                // }
            }
        },
        scrollup:function(scroll_y){
            //scrolling-up
            if(navbar.onscrollstate){
                // if(scroll_y <= 10){
                    navbar.classList.remove('onscroll');
                    menu.classList.remove('onscroll');
                    navbar.onscrollstate = false;
                // }
            }
        }
    })

    // endCSS
    var endCss = document.createElement('style');
    body.appendChild(endCss);
    chrome.storage.local.get("mal_redesigned_end",function(res){
        endCss.appendChild(document.createTextNode(res.mal_redesigned_end));
    })

    // anime-trailer
    var trailer = $cls('anime-detail-header-video')[0];
    if(trailer){
        var temp1 = $e("[itemprop='description']");
        temp1.previousElementSibling.insertAdjacentElement('beforebegin',trailer);
        trailer.classList.add('repositioned');
    }

    // to do when document is completely loaded
    onDocumentReady(function(){
        
        // js-truncate-outer
        var truncate = $cls('js-truncate-outer');
        if(truncate){
            fast4(0, truncate.length, function(i){
                var btn = truncate[i].$e('.btn-truncate');
                if(btn){
                    var data = JSON.parse(btn.getAttribute('data-height'));
                    var temp = truncate[i].offsetHeight - data.outer;
                    data.inner = data.inner + temp;
                    btn.setAttribute('data-height',JSON.stringify(data));
                }
            })
        }

        // horizontal nav
        var hNav = $id("horiznav_nav");
        if(hNav){
            hNav.addEventListener('click',function(event){
                var target = event.target;
                if(target.tagName === "LI"){
                    var a = target.$e('a');
                    a.click();
                }
            });
        }

        // extra script
        chrome.storage.local.get("extra_script",function(res){
            if(res.extra_script !== null){
                var extra_script = document.createElement('script');
                extra_script.appendChild(document.createTextNode(res.extra_script));
                body.appendChild(extra_script);
            }
        })
    })

    var scrollTop = new scrollToTopX();
}

chrome.runtime.sendMessage("checkForUpdate");