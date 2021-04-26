var body;
var rThis = this;
var docElem = document.documentElement;
var userList = false;
var flags = {};
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
        if(!pageURL[3]){
            docElem.id = "homePage";
            flags.homePage = true;
        }
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

    // if home page flags
    if(flags.homePage){
        upgradeHomePage();
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
                    data.inner = data.inner + temp + 100;
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

        // widget slides
        var slide_blocks = $cls("widget-slide-block");
        console.log(slide_blocks);
        fast4(0, slide_blocks.length,function(i){
            widget_slide(slide_blocks[i]);
        });

        // extra script
        chrome.storage.local.get("extra_script",function(res){
            if(res.extra_script !== null){
                var extra_script = document.createElement('script');
                extra_script.appendChild(document.createTextNode(res.extra_script));
                body.appendChild(extra_script);
            }
        })
    })

    // scroll Top Btn
    var scrollTop = new scrollToTopX();
    
    // extension menu
    extension_menu_init(navbar);
}

chrome.runtime.sendMessage("checkForUpdate");

// extra functions
function extension_menu_init(navbar){
    // extension menu
    let extension_menu = newBlock('div#extension_menu>span.day_night/Sun+span.layout/Layout');
    let day_night = extension_menu.objs.day_night;
    let layout = extension_menu.objs.layout;
    let extension_menu_btn = newBlock('div#extension_menu_btn>span.btn');
    extension_menu_btn[0].appendChild(extension_menu[0]);
    day_night_update(); layout_update();

    function day_night_update(callback){
        get("darkMode",function(res){
            res.darkMode ? function(){
                callback ? (callback(false),temp(false)) : temp(true);
            }() : function(){
                callback ? (callback(true),temp(true)) : temp(false);
            }();
        });
        
        function temp(x){
            if(x){
                day_night.classList.add('darkModeEnabled');
                day_night.innerText = "Moon";
            }
            else{
                day_night.classList.remove('darkModeEnabled');
                day_night.innerText = "Sun";
            }
        }
    }
    day_night.addEventListener('click',function(){
        day_night_update(function(a){set({darkMode:a})});
    });

    function layout_update(callback){
        get("layout",function(res){
            res.layout === 'new' ? function(){
                callback ? (callback('old'),temp('old')) : temp('new');
            }() : function(){
                callback ? (callback('new'),temp('new')) : temp('old');
            }();
        });

        function temp(x){
            if(x==='new')
                layout.classList.add('new');
            else
                layout.classList.remove('new');
        }
    }
    layout.addEventListener('click',function(){
        layout_update(function(a){set({layout:a})});
    });

    navbar.appendChild(extension_menu_btn[0]);
}

function upgradeHomePage(){
    let main_container = $id('content');

    // adding profile picture
    let panel_settings = document.getElementsByClassName('header-right')[0];
    let profile_picture = document.getElementsByClassName('header-profile')[1].cloneNode(true);
    profile_picture.id = "homePagePicture";
    panel_settings.insertAdjacentElement('beforebegin',profile_picture);

    // user related widgets
    // uw = user_widgets
    let uw = {
        discussions : $e('article .anime_discussions').parentElement,
        watched_topics : $e('article .watched_topics').parentElement,
        statistics : $e('article .my_statistics').parentElement,
        birthdays : $e('article .friend_birthdays').parentElement,
        friend_updates : $e('article .friend_list_updates').parentElement
    }
    let uw_keys = Object.keys(uw);
    let right_panel = uw.statistics.parentElement;

    uw.statistics.insertAdjacentElement('beforebegin',uw.discussions);
    uw.statistics.insertAdjacentElement('beforebegin',uw.watched_topics);

    // side user bar
    let side_user_bar = document.createElement('div');
    side_user_bar.id = "side_user_bar";
    let user_bar_item = document.createElement('span');
    user_bar_item.className = "user_bar_item";
    let user_bar_items = [];
    fast4(0,uw_keys.length,function(i){
        let temp = user_bar_item.cloneNode();
        temp.classList.add(uw_keys[i]);
        temp.appendChild(document.createTextNode(uw_keys[i].replace('_',' ')));

        temp.addEventListener('mouseover',function(event){
            console.log(uw_keys[i]);
            if(temp.ref){
                temp.ref.classList.add('showBox');
                position_ref(event,temp.ref);
            }
            else{
                let block = newBlock("div.user_widget>span.expand+span.close");
                block[0].appendChild(uw[uw_keys[i]]);
                temp.ref = block[0];
                body.appendChild(temp.ref);
                temp.ref.classList.add('showBox');
                position_ref(event,temp.ref);
            }

            function position_ref(event,block){
                let btn = temp.getBoundingClientRect();
                let doc_width = document.documentElement.offsetWidth;
                let doc_height = document.documentElement.clientHeight;
                let elem_width = block.offsetWidth;
                let elem_height = block.offsetHeight;
                let x = btn.x; 
                let y = btn.y + window.pageYOffset;
                let y_temp = event.clientY;
                let direction_x = x > (doc_width-x) ? 'left' : 'right'; 
                let direction_y = y_temp > (doc_height-y_temp) ? 'top' : 'bottom';
                console.log(direction_y,y);
                let left = direction_x === 'left' ? x + btn.width - elem_width : x; 
                let top = direction_y === 'top' ? y - elem_height : y + btn.height;
                
                block.style.top = top + 'px';
                block.style.left = left + 'px';
            }
        });
        temp.addEventListener('mouseout',function(){
            temp.ref.classList.remove('showBox');
        });
        user_bar_items.push(temp);
        side_user_bar.appendChild(temp);
    });
    main_container.insertAdjacentElement('beforebegin',side_user_bar);

    // top anime widgets
    let top_airing = $cls('airing_ranking')[0];
    let top_upcoming = $cls('upcoming_ranking')[0];
    let most_popular = $cls('popular_ranking')[0];

    let top_anime = document.createElement('div');
    let top_anime_btn = document.createElement('span');
    top_anime.id = "top_anime_container";
    top_anime_btn.id = "top_anime_btn";
    top_airing ? top_anime.appendChild(top_airing.parentElement):null;
    top_upcoming ? top_anime.appendChild(top_upcoming.parentElement):null;
    most_popular ? top_anime.appendChild(most_popular.parentElement):null;
    top_anime.appendChild(top_anime_btn);
    main_container.insertAdjacentElement('beforebegin',top_anime);

    top_anime_btn.addEventListener('click',function(){
        let max_height = top_anime.scrollHeight + "px";

        if(top_anime.classList.contains('expanded')){
                top_anime.classList.remove('expanded');
                top_anime.style.maxHeight = "";
        } 
        else{
            top_anime.classList.add('expanded');
            top_anime.style.maxHeight = max_height;
        }
    });
}

function widget_slide(slide){
    // declaring data
    let slideOuter = slide.$e('.widget-slide-outer');
    let outerWidth = slideOuter.offsetWidth;
    let ul = slideOuter.$e('ul');
    let btn_r = slide.$e('.btn-widget-slide-side.right');
    let btn_l = slide.$e('.btn-widget-slide-side.left');
    let ul_width = ul.offsetWidth;
    let li = ul.children;
    let li_width = li[0].offsetWidth + li[0].$cs('margin-right',true);
    let liPerRow = slideOuter.offsetWidth/li_width;
    let liRowWidth = liPerRow * li_width;    
    let range = ul_width - (liPerRow * li_width);
    let first_li = 0;    
    
    //assigning events
    btn_r.addEventListener('click',function(event){
        event.stopPropagation();
        console.log('right clicked');
        move('right',btn_r);
    }); 
    btn_l.addEventListener('click',function(event){
        event.stopPropagation();
        console.log("left clicked");
        move('left',btn_l);
    });
    
    function pxToMove(flow){
        let temp = outerWidth/li_width;
        temp = (temp%1).toFixed(1) > 0.7 ? Math.round(temp) : Math.floor(temp);
        let maxLimit = li.length - temp;
        let outerOffsetLeft = slideOuter.getBoundingClientRect().x;
        let toReturn = null;
        
        if(flow === 'right'){
            first_li = Math.min(maxLimit, Math.max(0, (first_li + temp)));
        }
        else{
            first_li = Math.min(maxLimit, Math.max(0, (first_li - temp)));
        }
        
        toReturn = li[first_li].getBoundingClientRect().x - outerOffsetLeft;
        return toReturn;
    }

    function move(flow,btn){
        let transform = ul.$cs('transform').match(/matrix.*\((.+)\)/)[1].split(', ');
        outerWidth = slideOuter.offsetWidth;
        let transform_limit = -(((ul_width/outerWidth)-1)*outerWidth);
        if(flow === 'right'){
            transform[4] = Math.min(0, Math.max(transform_limit, (transform[4] - pxToMove('right'))));
            ul.style.transform = "matrix(" + transform.join() + ")";
        }
        else{
            transform[4] = Math.min(0, Math.max(transform_limit, (transform[4] - pxToMove('left'))));
            ul.style.transform = "matrix(" + transform.join() + ")";
        }

        if(transform[4] === 0 || transform[4] <= (transform_limit + 10)){
            btn.classList.add("noElemAhead");
            setTimeout(function(){
                btn.classList.remove("noElemAhead");
            },300);
        }
    }
}