var body;
var rThis = this;
var docElem = document.documentElement;
var userList = false;
var flags = {};
const observer = new Mutate([false,true,true]);
const observer2 = new Mutate([false,true,false]);

// inserting style tag
var mal_redesigned = document.createElement('style');
mal_redesigned.id = "mal_css";
var mal_redesigned_dark = document.createElement('style');
mal_redesigned_dark.id = "mal_dark_css";
var docHead = document.head;
if(!docHead){
    observer2.start(docElem,function(mutation){
        var node = mutation.addedNodes[0];
        if(node && node.tagName === 'HEAD'){
            node.insertAdjacentElement('afterend',mal_redesigned_dark);
            node.insertAdjacentElement('afterend',mal_redesigned);
            observer2.stop();
            return true;
        }
    })   
}
else{
    docHead.insertAdjacentElement('afterend',mal_redesigned_dark);
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
        else flags.profile = true;
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

let toGet = ['enabled','ads','mal_redesigned','mal_redesigned_dark','layout','darkMode'];
chrome.storage.local.get(toGet,function (response){
    if((response.enabled && !userList)){
        mal_redesigned.appendChild(document.createTextNode(response.mal_redesigned));

        // darkModeCss
        response.darkMode ? 
        (
            mal_redesigned_dark.appendChild(document.createTextNode(response.mal_redesigned_dark)),
            docElem.classList.add('darkMode'),
            flags.darkMode=true
        ) 
        : flags.darkMode=false;

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

    if(response.layout === 'new'){
        docElem.classList.add('newLayout');

        // if home page flag
        if(flags.homePage){
            docElem.classList.add('newHomepage');
            upgradeHomePage();
        } 
        else if(flags.profile){
            docElem.classList.add('newProfile');
            upgradeProfile();
        }  
    } else{
        body.classList.add('oldLayout');
    }
    
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

    // anime-trailer
    var trailer = $cls('anime-detail-header-video')[0];
    if(trailer){
        var temp1 = $e("[itemprop='description']");
        temp1.previousElementSibling.insertAdjacentElement('beforebegin',trailer);
        trailer.classList.add('repositioned');
    }

    // widget slides
    var slide_blocks = $cls("widget-slide-block");
    var slide_blocks_2 = $cls("js-auto-recommendation");
    
    if(slide_blocks){
        fast4(0, slide_blocks.length,function(i){
            let interval = setInterval(function(){
                if(slide_blocks[i].$e('.left')){
                    widget_slide(slide_blocks[i]);
                    clearInterval(interval);
                }
            },200);
        });
    }
    if(slide_blocks_2){
        fast4(0, slide_blocks_2.length,function(i){
            let interval = setInterval(function(){
                if(slide_blocks_2[i].$e('.left')){
                    widget_slide(slide_blocks_2[i]);
                    clearInterval(interval);
                }
            },200);
        });
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
    })

    // scroll Top Btn
    var scrollTop = new scrollToTopX();
    
    // extension menu
    extension_menu_init(navbar);
}

// extra functions
function extension_menu_init(navbar){
    // extension menu
    let temp_query = 'div#extension_menu>span.day_night/Sun+span.layout/Layout+span.ads/Ads';
    let extension_menu = newBlock(temp_query);
    let day_night = extension_menu.objs.day_night;
    let layout = extension_menu.objs.layout;
    let Ads = extension_menu.objs.ads;
    let extension_menu_btn = newBlock('div#extension_menu_btn>span.btn');
    extension_menu_btn[0].appendChild(extension_menu[0]);
    day_night_update(); layout_update(); toggleAds();

    // change to dark mode btn
    function day_night_update(callback){
        get("darkMode",function(res){
            res.darkMode ? function(){
                callback ? 
                (
                    callback(false),
                    temp(false),
                    docElem.classList.remove('darkMode')
                ) 
                : temp(true);
            }() : function(){
                callback ? 
                (
                    callback(true),
                    temp(true),
                    docElem.classList.add('darkMode')
                ) 
                : temp(false);
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
        day_night_update(function (a) {
            let style = $id('mal_dark_css');
            let style_length = style.sheet.rules.length;
            if(a){
                style_length ? 
                style.disabled = false
                :(
                    get('mal_redesigned_dark',function(res){
                        style.appendChild(document.createTextNode(res.mal_redesigned_dark))
                    })
                ) 
            }
            else{
                style.disabled = true
            }
            set({ darkMode: a });
        });
    });

    // change layout btn
    function layout_update(callback){
        get("layout", function (res) {
          res.layout === "new"
            ? (function () {
                callback ? 
                (
                    callback("old"), 
                    temp("old"),
                    window.location.reload()                    
                ) 
                : temp("new");
              })()
            : (function () {
                callback ? 
                (
                    callback("new"), 
                    temp("new"),
                    window.location.reload()
                ) 
                : temp("old");
              })();
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

    // turn off ads
    function toggleAds(flag){
        get("ads",function(res){
            if(flag){
                res.ads ? (set({ads:false}),temp(false)) : (set({ads:true}),temp(true));
                chrome.runtime.sendMessage("toggleAds");
            }
            else temp(res.ads)
        })

        function temp(x){
            x ?
            Ads.classList.remove('ads-disabled') 
            : Ads.classList.add('ads-disabled')
        }
    }
    Ads.addEventListener('click',function(){
        toggleAds(true);
    });

    navbar.appendChild(extension_menu_btn[0]);
}

function upgradeHomePage(){
    let main_container = $id('content');

    // adding profile picture
    let panel_settings = $cls('header-right')[0];
    if(panel_settings){
        let profile_picture = $cls('header-profile')[1].cloneNode(true);
        profile_picture.id = "homePagePicture";
        panel_settings.insertAdjacentElement('beforebegin',profile_picture); 
        
        // user related widgets
        // uw = user_widgets
        let uw = {
            discussions : $e('.anime_discussions'),
            watched_topics : $e('.watched_topics'),
            statistics : $e('.my_statistics'),
            birthdays : $e('.friend_birthdays'),
            friend_updates : $e('.friend_list_updates')
        }
        let uw_keys = Object.keys(uw);

        // side user bar
        let side_user_bar = document.createElement('div');
        side_user_bar.id = "side_user_bar";
        let user_bar_item = document.createElement('span');
        user_bar_item.className = "user_bar_item";
        let user_bar_items = [];
        fast4(0,uw_keys.length,function(i){
            let elem = uw[uw_keys[i]];
            if(elem){
                elem.parentElement.remove();
                let temp = user_bar_item.cloneNode();
                temp.classList.add(uw_keys[i]);
                temp.appendChild(document.createTextNode(uw_keys[i].replace('_',' ')));

                temp.addEventListener('mouseover',function(event){
                    if(temp.ref){
                        temp.ref.classList.add('showBox');
                        position_ref(event,temp.ref);
                    }
                    else{
                        let block = newBlock("div.user_widget>span.expand+span.close");
                        block[0].appendChild(elem.parentElement);
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
            }
        });
        main_container.insertAdjacentElement('beforebegin',side_user_bar);
    }

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

function upgradeProfile(){
    let profile_about = $cls('user-profile-about')[0];
    let stats = $id('statistics');
    let favorites = $cls('user-favorites-outer')[0];
    let comments = $id('lastcomment');

    let user_blocks = Array.prototype.slice.apply($cls('user-status'));
    let user_firends = $cls('user-friends')[0];
    user_firends = wrap([user_firends.previousElementSibling,user_firends],'section.user-friends-block');
    let user_sns = $cls('user-profile-sns')[0];
    user_sns = wrap([user_sns.previousElementSibling,user_sns],'section.user-sns-block');
    user_blocks.push(user_firends,user_sns);

    let tabs_nav = newBlock('div.tabs-nav > span.active/about + span/statistics + span/favorites + span/comments');
    let tabs_container = newBlock('div.tabs-content > div#pabout.on + div#pstats + div#pfav + div#pcomments');
    let tabs = newElement({e:'div',id:'tabs'});

    for(let i = 0; i <user_blocks.length; i++){
        tabs_container.objs.pabout.appendChild(user_blocks[i]);
    }
    
    profile_about ? tabs_container.objs.pabout.appendChild(profile_about):null;
    stats ? tabs_container.objs.pstats.appendChild(stats):null;
    favorites ? tabs_container.objs.pfav.appendChild(favorites):null;
    comments ? tabs_container.objs.pcomments.appendChild(comments):null;

    let tab_keys = {
        about:'pabout',
        statistics:'pstats',
        favorites:'pfav',
        comments:'pcomments'
    }

    // attatching events
    tabs_nav[0].addEventListener('click',function(event){
        let elem = event.target;
        if(elem.nodeName.toLowerCase() === 'span'){
            elem.classList.contains('active') ? null : (
                this.$e('.active').classList.remove('active'),
                tabs_container[0].$e('.on').classList.remove('on'),
                elem.classList.add('active'),
                tabs_container.objs[tab_keys[elem.innerText]].classList.add('on')
            )
        }
    });

    tabs.appendChild(tabs_nav[0]);
    tabs.appendChild(tabs_container[0]);
    $cls('content-container')[0].appendChild(tabs);

    // initilizing slide block for favorites
    let slide_outers = favorites.firstElementChild.children;
    slide_outers.$loop(function(i){
        slideBlock(slide_outers[i].lastElementChild,slide_outers[i]);
    });
}

function widget_slide(slide){
    // declaring data
    let slideOuter = slide.$e('.widget-slide-outer') || slide;
    let outerWidth = slideOuter.offsetWidth;
    let ul = slideOuter.$e('ul') || slideOuter.$e('.items');
    let btn_r = slide.$e('.right');
    let btn_r_new = btn_r.cloneNode(true);
    let btn_l = slide.$e('.left');
    let btn_l_new = btn_l.cloneNode(true);
    slide.replaceChild(btn_r_new,btn_r);
    slide.replaceChild(btn_l_new,btn_l);
    let ul_width = ul.offsetWidth;
    let li = ul.children;
    let li_width = li[0].offsetWidth + li[0].$cs('margin-right',true);
    let liPerRow = slideOuter.offsetWidth/li_width;
    let liRowWidth = liPerRow * li_width;    
    let range = ul_width - (liPerRow * li_width);
    let first_li = 0;    
    
    //assigning events
    btn_r_new.addEventListener('click',function(event){
        event.stopPropagation();
        console.log('right clicked');
        move('right',btn_r_new);
    }); 
    btn_l_new.addEventListener('click',function(event){
        event.stopPropagation();
        console.log("left clicked");
        move('left',btn_l_new);
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