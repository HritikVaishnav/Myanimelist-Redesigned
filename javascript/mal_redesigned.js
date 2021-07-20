var body;
var rThis = this;
var docElem = document.documentElement;
var userList = false;
var flags = {};
const observer = new Mutate([false,true,true]);
const observer2 = new Mutate([false,true,false]);
const pageURL = document.URL.split(/[/?]/);

// function to manage loading
const defaultLoadingCss = "body{overflow:hidden!important}#load_bg{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:#293e6a;z-index:1000}#load_box{display:flex;position:fixed;align-items:center;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1001;height:calc(100vw / 5);max-height:150px}#load_box>img{min-width:0;height:100%}";
function manageLoading(){
    if(!flags.loading){
        const layout = newBlock('div#load_bg + {div#load_box > img.txt + img.gif} + style#load_style');
        layout.objs.txt.src = chrome.runtime.getURL('images/temp/Asset10.svg');
        layout.objs.gif.src = chrome.runtime.getURL('images/loading/'+anime.random(1,14)+'.gif');
        layout.objs.load_style.appendChild(document.createTextNode(defaultLoadingCss));

        let fragment = new DocumentFragment();
        fragment.$addChildren([layout[2],layout[0],layout[1]]);
        docElem.appendChild(fragment);
        flags.loading = true;
    }
    else{
        $id('load_style').sheet.deleteRule(0);
        anime({
            targets: ['#load_bg','#load_box'],
            easing: 'easeOutCirc',
            duration: 600,
            opacity: 0,
            complete: function(){
                $id('load_style').remove();
                $id('load_box').remove();
                $id('load_bg').remove();
            }
        })
    }
}

// function to detect main table
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

// checking if extension is enabled
const malr_enabled = localStorage.malr_enabled;
const filterList = ['temp','animelist','mangalist','apiconfig'];
if(malr_enabled !== 'false' && filterList.indexOf(pageURL[3]) < 1){
    localStorage.malr_loading !== 'false' ? manageLoading() : null;
    
    // inserting style tag
    var mal_redesigned = newElement({e:'style', id:'mal_css'});
    var mal_redesigned_dark = newElement({e:'style', id:'mal_dark_css'});
    var mal_ads = newElement({e:'style', id:'mal_ads_css'});

    // fetching and assigning css to style tags
    let toGet = ['ads','mal_redesigned','mal_redesigned_dark'];
    chrome.storage.local.get(toGet, function(css){
        mal_redesigned.appendChild(document.createTextNode(css.mal_redesigned));

        // dark mode css
        if(localStorage.malr_dark === 'true'){
            mal_redesigned_dark.appendChild(document.createTextNode(css.mal_redesigned_dark));
            docElem.classList.add('darkMode'),
            flags.darkMode=true
        } else{
            flags.darkMode=false
        }

        // ads css
        if(localStorage.malr_ads === 'false'){
            let css = "#tbl-next-up,.mal-ad-unit,.amazon-ads,.ad-sas{display:none !important}";
            mal_ads.appendChild(document.createTextNode(css));
        }
    });

    // appending style tags to document
    var docHead = document.head;
    if(!docHead){
        observer2.start(docElem,function(mutation){
            var node = mutation.addedNodes[0];
            if(node && node.tagName === 'HEAD'){
                node.insertAdjacentElement('afterend',mal_ads);
                node.insertAdjacentElement('afterend',mal_redesigned_dark);
                node.insertAdjacentElement('afterend',mal_redesigned);
                observer2.stop();
                return true;
            }
        })   
    }
    else{
        docHead.insertAdjacentElement('afterend',mal_ads);
        docHead.insertAdjacentElement('afterend',mal_redesigned_dark);
        docHead.insertAdjacentElement('afterend',mal_redesigned);
    }

    // identifying page type
    switch (pageURL[3]) {
        case 'anime':
            docElem.id = flags.activePage = "animePage";
            pageURL[6] ? docElem.className = 'animeTabs' : flags.animePage = true;
            pageURL[7] ? null : MainTableIdentity("MainTable");
            break;
        case 'manga':
            docElem.id = flags.activePage = "mangaPage";
            pageURL[6] ? null : flags.manga = true;
            MainTableIdentity("MainTable");
            break;
        case 'character':
            docElem.id = flags.activePage = "characterPage";
            MainTableIdentity("MainTable");
            break;
        case 'people':
            docElem.id = flags.activePage = "peoplePage";
            MainTableIdentity("MainTable");
            break;
        case 'forum':
            docElem.id = flags.activePage = "forumPage";
            flags.forum = true;
            break;
        case 'featured':
            docElem.id = flags.activePage = "featuredPage";
            break;
        case 'addtolist.php':
            docElem.id = flags.activePage = "quickaddPage";
            break;
        case 'users.php':
            docElem.id = flags.activePage = "usersPage";
            MainTableIdentity("UsersMainTable");
            break;
        case 'people.php':
            docElem.id = flags.activePage = "peopleListPage";
            break;
        case 'mymessages.php':
            docElem.id = flags.activePage = "mymessagesPage";
            break;
        case 'profile':
            if(pageURL[5]){
                docElem.id = flags.activePage = "profileTabs";
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
            docElem.id = flags.activePage = "recommendationsPage";
            break;
        case 'clubs.php':
            docElem.id = flags.activePage = "clubsPage";
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
            docElem.id = flags.activePage = "sharedPage";
            break;        
        case 'editprofile.php':
            docElem.id = flags.activePage = "editprofilePage";
            break;        
        case 'about.php':
            if(pageURL[4]){
                if(pageURL[4].search("=team") >= 0){
                    docElem.id = flags.activePage = "staffPage";
                }
            }
            break;        
        default:
            if(!pageURL[3]){
                docElem.id = flags.activePage = "homePage";
                flags.homePage = true;
            }
            break;
    }

    // on DOM loaded
    onDomLoad(function(){
        script();
    })
}
else{
    onDomLoad(function(){
        let menu = extension_menu_init($id('header-menu'));
        menu.classList.add('extension_disabled');
    })
}

function script(){
    body = document.body;
    var navbar = $id('headerSmall');
    var menu = $id('menu');

    // changing existing layouts
    if(flags.animePage || flags.manga){
        let leftContainer = $cls('breadcrumb')[0].nextElementSibling;
        let headings = leftContainer.$E('@h2');
        let sections = {};
        sections[flags.manga ? 'Manga stats':'Anime stats'] = [$cls('anime-detail-header-stats')[0]];
        flags.manga ? null : sections['Anime video'] = [$cls('anime-detail-header-video')[0]];
        headings.$loop(function(i){
            let temp = [];
            let helper = flags.manga ? headings[i] : headings[i].parentElement;
            let headTxt = headings[i].lastChild.data.match(/[A-Za-z].*[A-Za-z]+/,'')[0];
            temp.push(helper);
            switch (headTxt) {
                case "Background":
                    temp = temp.concat(selectTill(helper,{tag:'br'}))
                    break;
                case "Reviews":
                    temp = temp.concat(selectTill(helper,{tag:'div',class:'mt4'}))
                    break;
                case "Recent News":
                    temp = temp.concat(selectTill(helper,{tag:'br'}))
                    break;
            
                default:
                    temp.push(helper.nextElementSibling)
                    break;
            }
            sections[headTxt] = temp;
        });

        createToggleSections({
            sections:sections, 
            btnParent:$cls('header-right')[0], 
            storage: flags.manga ? 'malr_mpss' : 'malr_apss'
        });
    }
    else if(flags.forum){
        // create toggle btn
        let btn = newElement({e:'button',txt:'Compact Mode',id:'forumCompactBtn'});
        btn.addEventListener('click',function(){
            toggleForumCompact(true);
        })
        function toggleForumCompact(flag){
            let temp = localStorage.malr_forum_compact;
            flag ? temp === 'true' ? localStorage.malr_forum_compact = temp = 'false' : localStorage.malr_forum_compact =  temp = 'true' : null;
            temp === 'true' ? 
                ($id('contentWrapper').classList.add('forumCompact'), btn.classList.add('on')) 
                : ($id('contentWrapper').classList.remove('forumCompact'), btn.classList.remove('on'));
        }
        $cls('header-right')[0].insertAdjacentElement('beforebegin',btn);
        toggleForumCompact();
    }

    // initialize new layout
    if(localStorage.malr_new_layout !== 'old'){
        docElem.classList.add('newLayout');

        if(flags.homePage){
            if(localStorage.malr_new_home_page !== 'false'){
                docElem.classList.add('newHomepage');
                upgradeHomePage();
            }
        } 
        else if(flags.profile){
            if(localStorage.malr_new_profile_page !== 'false'){
                docElem.classList.add('newProfile');
                upgradeProfile();
            }
        }  
    } else{
        body.classList.add('oldLayout');
    }
    
    // initialize navbar function on scrolling
    $onscroll({
        scrolldown:function(scroll_y){
            //scrolling-down
            if(!navbar.onscrollstate){
                navbar.classList.add('onscroll');
                menu.classList.add('onscroll');
                navbar.onscrollstate = true;
            }
        },
        scrollup:function(scroll_y){
            //scrolling-up
            if(navbar.onscrollstate){
                navbar.classList.remove('onscroll');
                menu.classList.remove('onscroll');
                navbar.onscrollstate = false;
            }
        }
    })

    // anime-trailer-reposition
    var trailer = $cls('anime-detail-header-video')[0];
    if(trailer){
        var temp1 = $e("[itemprop='description']");
        temp1.previousElementSibling.insertAdjacentElement('beforebegin',trailer);
        trailer.classList.add('repositioned');
    }

    // widget slides
    makeSliderFromSlideBlocks($cls('widget-slide-block'),true);
    makeSliderFromSlideBlocks($cls('js-auto-recommendation'),true);
    makeSliderFromSlideBlocks($cls('anime-slide-block'),false);
    function makeSliderFromSlideBlocks(slide_blocks,custom_btn_only){
        if(slide_blocks){
            fast4(0, slide_blocks.length,function(i){
                let interval = setInterval(function(){
                    if(slide_blocks[i].$e('.left')){
                        make_malr_slider({
                            list: slide_blocks[i].$e('.widget-slide') || slide_blocks[i].$e('.items') || slide_blocks[i].$e('.anime-slide'),
                            btnContainer: slide_blocks[i],
                            btns: {
                                right: cloneAndReplace(slide_blocks[i].$e('.right')),
                                left: cloneAndReplace(slide_blocks[i].$e('.left')),
                                removeDefault: custom_btn_only
                            }
                        });
                        clearInterval(interval);
                    }
                },200);
            });
        }   
    }

    // scroll Top Btn
    new scrollToTopX();
    
    // extension menu
    extension_menu_init(navbar);

    // remove loading screen
    if(flags.loading){
        setTimeout(function() {
            manageLoading();
        },300)
    }

    // checking malr_sliders overflow
    setTimeout(function() {
        malr_slider_check_overflow();
    },500)

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
}

// extra functions
function extension_menu_init(navbar){
    // extension menu
    
    // injecting menu style
    let malr_menu_style = document.createElement('style');
    mal_redesigned ? 
        mal_redesigned.insertAdjacentElement('afterend',malr_menu_style)
        : docElem.firstElementChild.insertAdjacentElement('afterend',malr_menu_style)
    chrome.storage.local.get('malr_menu',function(res){
        malr_menu_style.appendChild(document.createTextNode(res.malr_menu));
    })
    
    let malrToggleBtn = "{div.toggleMalr>span/Toggle_Extension+span.switch}";
    let layoutMenu = "{div.layout>div/Layout+{ul>li/home_page+li/anime_page+li/profile_page}}";
    let temp_query = `div#malr_menu>${malrToggleBtn}+{div.day_night>div/Sun}+${layoutMenu}+{div.ads>div/Ads}+{div.loading>div/Loading}`;
    let malr_menu = newBlock(temp_query);
    let extensionToggleBtn = malr_menu.objs.toggleMalr;
    let day_night = malr_menu.objs.day_night;
    let layout = malr_menu.objs.layout;
    let Ads = malr_menu.objs.ads;
    let loading = malr_menu.objs.loading;
    let malr_menu_btn = newBlock('div#malr_menu_btn>span.btn');
    malr_menu_btn[0].appendChild(malr_menu[0]);
    toggleExtension(); day_night_update(); layout_update(); layout_pages(); toggleAds(); toggleLoading();

    // menu toggle event
    let tempEventHandler = function(){malr_menu_btn[0].click()};
    malr_menu[0].addEventListener('click',function(e){e.stopPropagation()});
    malr_menu_btn[0].addEventListener('click',function(e){
        e.stopPropagation();
        if(malr_menu[0].state){
            malr_menu[0].state = false;
            document.removeEventListener('click',tempEventHandler);
            anime({
                targets: malr_menu[0],
                duration: 300,
                translateX: '120%',
                complete: function(){
                    malr_menu_btn[0].classList.toggle('active');
                    malr_menu[0].style.transform = '';
                },
                easing:'easeInOutCirc'
            });
        }
        else{
            malr_menu[0].state = true;
            document.addEventListener('click',tempEventHandler);
            malr_menu_btn[0].classList.toggle('active');
        }
    });

    // toggle extension
    function toggleExtension(updateFlag){
        let temp = localStorage.malr_enabled;
        updateFlag ? temp !== 'false' ? localStorage.malr_enabled = temp = 'false' : localStorage.malr_enabled = temp = 'true' : null;
        temp !== 'false' ?
            extensionToggleBtn.classList.remove('off')
            : extensionToggleBtn.classList.add('off')
        updateFlag ? window.location.reload() : null;    
    }
    extensionToggleBtn.addEventListener('click',function(){toggleExtension(true)});

    // change to dark mode btn
    function day_night_update(updateFlag){
        let temp = localStorage.malr_dark;
        updateFlag ? temp === 'true' ? (updateSettings(false),temp='false') : (updateSettings(true),temp='true') : null;
        temp === 'true' ? (
            docElem.classList.add('darkMode'),
            day_night.classList.add('darkModeEnabled'),
            day_night.firstElementChild.innerText = "Moon"
        ) : (
            docElem.classList.remove('darkMode'),
            day_night.classList.remove('darkModeEnabled'),
            day_night.firstElementChild.innerText = "Sun"
        );

        function updateSettings(a) {
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
            localStorage.malr_dark = a;
        }
    }
    day_night.addEventListener('click',function(){day_night_update(true)});

    // change layout btn
    function layout_update(updateFlag){
        let temp = localStorage.malr_new_layout;
        updateFlag ? temp !== "old" ? localStorage.malr_new_layout = temp = 'old' : localStorage.malr_new_layout = temp = 'new' : null;
        temp !== "old" ? layout.classList.add('new') : layout.classList.remove('new');
        updateFlag ? window.location.reload() : null;
    }
    function layout_pages(page){
        let list = page ? null : malr_menu[0].$E('@li');
        page ? temp(page) : fast4(0,list.length,function(i){temp(list[i])});
        function temp(e){
            switch (e.innerText.toLocaleLowerCase()) {
                case 'home page':
                    updateSettings(e,['malr_new_home_page','homePage']);
                    break;
                case 'anime page':
                    updateSettings(e,['malr_new_anime_page','animePage']);
                    break;
                case 'profile page':
                    updateSettings(e,['malr_new_profile_page','profile']);
                    break;
                default:
                    break;
            }
        }
        function updateSettings(e,keys){
            let temp = localStorage[keys[0]];
            page ? temp !== 'false' ? localStorage[keys[0]] = temp = 'false' : localStorage[keys[0]] = temp = 'true' : null;
            temp !== 'false' ? e.classList.add('active') : e.classList.remove('active');
            page ? flags[keys[1]] ? window.location.reload() : null : null;
        }
    }
    layout.addEventListener('click',function(e){
        e.target.tagName.toLowerCase() === 'li' ? layout_pages(e.target) : layout_update(true);
    });

    // turn off ads
    function toggleAds(updateFlag){
        let temp = localStorage.malr_ads;
        updateFlag ? temp !== 'false' ? localStorage.malr_ads = temp = 'false' : localStorage.malr_ads = temp = 'true' : null;
        temp !== 'false' ? Ads.classList.remove('ads-disabled') : Ads.classList.add('ads-disabled');
        updateFlag ? chrome.runtime.sendMessage('toggleAds') : null;
    }
    Ads.addEventListener('click',function(){toggleAds(true)});

    // toggle loading
    function toggleLoading(updateFlag){
        let temp = localStorage.malr_loading;
        updateFlag ? temp !== 'false' ? localStorage.malr_loading = temp = 'false' : localStorage.malr_loading = temp = 'true' : null;
        temp !== 'false' ? loading.classList.remove('loading_disabled') : loading.classList.add('loading_disabled');
    }
    loading.addEventListener('click',function(){toggleLoading(true)});

    navbar.appendChild(malr_menu_btn[0]);
    return malr_menu_btn[0];
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

    let tempBlock = newElement({e:'div',id:'new_widget_wrapper'});
    let widget_list = $multiselect('.announcements,.featured,.my_list_updates,.reviews,.recommendations,.news');
    let sliders = [];
    widget_list.forEach(function(item){
        if(item){
            let temp = item.parentElement;
            tempBlock.appendChild(temp);
            let list = item.$e('.news-list') || item.$e('.widget-content');
            sliders.push(list);
            make_malr_slider({
                list: list,
                btnContainer: item.firstElementChild
            });
        }
    })

    $id('top_anime_container').insertAdjacentElement('afterend',tempBlock);
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
    user_blocks.push(user_firends,user_sns,profile_about);

    make_malr_slider({
        list: user_firends.lastElementChild,
        btnContainer: user_firends.firstElementChild,
        grid: false
    });

    let tabs = create_malr_tabs({
        'about':user_blocks,
        'statistics':[stats],
        'favorites':[favorites],
        'comments':[comments]
    },'about');
    $cls('content-container')[0].appendChild(tabs);

    // initilizing sliders for favorites
    let slide_outers = favorites.firstElementChild.children;
    slide_outers.$loop(function(i){
        make_malr_slider({
            list: slide_outers[i].lastElementChild,
            btnContainer: slide_outers[i].firstElementChild
        });
    });
}

// malr slider functions
function make_malr_slider({list, btnContainer, grid, scroll, btns}){
    // checking if malr slider style is added
    if(!flags.malr_slider_style){
        flags.malr_slider_style = true;
        let malr_slider_style = newElement({e:'style',id:'slider_css'});
        mal_redesigned.insertAdjacentElement('afterend',malr_slider_style);
        chrome.storage.local.get('malr_slider',function(res){
            malr_slider_style.appendChild(document.createTextNode(res.malr_slider));
        });
    }

    // adding classes and id
    list.classList.add('sliderList');
    list.parentElement.classList.add('malrSlider');
    list.id ? null : list.id = 'slider' + anime.random(0,100000);

    // initiliazing events
    let hammer = new Hammer(list);
    let tempHandler = function(e){
        e.preventDefault();
        e.stopPropagation();
    }
    hammer.on('panstart',function(){
        list.addEventListener('click',tempHandler,true);
    });
    hammer.on('panend',function(){
        setTimeout(function() {
            list.removeEventListener('click',tempHandler,true);
        },100)
    });
    hammer.on('pan',function(e){
        let currentValue = list.scrollLeft;
        list.scrollLeft = currentValue - (e.srcEvent.movementX);
    });
    list.ondragstart = function(){ return false }

    let actions = newBlock('div.sliderActions>span.left+span.right+span.grid+span.togglescroll');
    grid === false ? actions.objs.grid.style.display='none' : null;
    scroll === false ? actions.objs.togglescroll.style.display='none' : null;

    if(btns){
        btns.right.onclick = function() {actions.objs.right.click()};
        btns.left.onclick = function() {actions.objs.left.click()};
        btns.removeDefault ? (
            actions.objs.right.style.display='none',
            actions.objs.left.style.display='none'
        ):null;
    }
    actions[0].addEventListener('click',function(e){
        let name = e.target.className;
        let currentValue = list.scrollLeft;
        let maxValue = list.scrollWidth - list.offsetWidth;
        switch (name) {
            case 'left':
                animeScroll(list.offsetWidth / 2)
                break;
            case 'right':
                animeScroll(-(list.offsetWidth / 2))
                break;
            case 'grid':
                if(anime.get(list,'flex-wrap') === 'nowrap'){
                    if(!list.styleElem){
                        let temp = `#${list.id}>*{width:${list.firstElementChild.offsetWidth}px!important}`;
                        let style = list.styleElem = newElement({e:'style',txt:temp});
                        document.head.appendChild(style);
                    }
                    else list.styleElem.disabled = false;
                    list.style.setProperty('flex-wrap','wrap','important');
                }
                else{
                    if(list.styleElem) list.styleElem.disabled = true;
                    list.style.setProperty('flex-wrap','nowrap','important'); 
                }
                list.classList.toggle('gridEnabled');
                malr_slider_check_overflow({'list':list,'actions':actions[0]},'showGridBtn');
                break;
            case 'togglescroll':
                if(anime.get(list,'overflow-x') === 'hidden')
                    list.style.setProperty('overflow-x','auto','important');
                else
                    list.style.setProperty('overflow-x','hidden','important'); 
                break;
            default:
                break;
        }
        function animeScroll(x){
            let value = Math.min(maxValue,Math.max(0,currentValue - x));
            anime({
                targets : list,
                scrollLeft: value,
                duration: 700,
                easing:'cubicBezier(.25, 0.1, .25, 1)'
            })
        }
    })
    btnContainer.insertAdjacentElement('afterbegin',actions[0]);
    window.malr_sliders ? window.malr_sliders.push({'list':list,'actions':actions[0]})
    :(
        window.malr_sliders = [],
        window.malr_sliders.push({'list':list,'actions':actions[0]})
    )
}
function malr_slider_check_overflow(slider,helperClass){
    if(slider) temp(slider)
    else if(window.malr_sliders){
        window.malr_sliders.forEach(function(item){
            temp(item)
        })
    }

    function temp(slider){
        if(slider.list.offsetWidth !== 0){
            if(slider.list.scrollWidth > slider.list.offsetWidth){
                slider.actions.classList.remove('nooverflow');
                helperClass ? slider.actions.classList.remove(helperClass):null;
            }
            else{
                slider.actions.classList.add('nooverflow')
                helperClass ? slider.actions.classList.add(helperClass):null;
            }
        }
        else if(slider.list.childElementCount === 0){
            slider.actions.classList.add('nooverflow');
            slider.list.classList.add('nochild');
        }
    }
}

// malr tabs functions
function create_malr_tabs(sections,activeTab){
    // checking if malr tabs style is added
    if(!flags.malr_tabs_style){
        flags.malr_tabs_style = true;
        let malr_tabs_style = newElement({e:'style',id:'tabs_css'});
        mal_redesigned.insertAdjacentElement('afterend',malr_tabs_style);
        chrome.storage.local.get('malr_tabs',function(res){
            malr_tabs_style.appendChild(document.createTextNode(res.malr_tabs));
        });
    }

    let tabs_tree = newBlock('div.malr_tabs_container > div.tabs_nav + div.tabs_content');
    let defaultTabBtn = newBlock('button#defaultTabBtn/Default>div#defaultTab');
    let tabs = Object.keys(sections);

    localStorage.malr_dpt ? null : activeTab ? localStorage.malr_dpt = activeTab : localStorage.malr_dpt = tab[0];
    activeTab = localStorage.malr_dpt;

    tabs.forEach(function(tab){
        let temp = tab === activeTab ? 'active' : undefined;
        let span = newElement({e:'span',txt:tab,cls:temp});
        let defaultTabOption = span.cloneNode(true);
        let container = newElement({e:'div',id:'malr_tab_'+tab,cls:temp});
        container.$addChildren(sections[tab]);
        tabs_tree.objs.tabs_nav.appendChild(span);
        tabs_tree.objs.tabs_content.appendChild(container);
        defaultTabBtn.objs.defaultTab.appendChild(defaultTabOption);
        temp ? (
                tabs_tree[0].active_tab = [span,container],
                defaultTabBtn.active_tab = defaultTabOption
            ) : null;
    });
    tabs_tree.objs.tabs_nav.appendChild(defaultTabBtn[0]);
    
    // event to change tabs
    tabs_tree.objs.tabs_nav.addEventListener('click',function(e){
        let temp = e.target.innerText;
        let container = $id('malr_tab_'+temp);
        let active_tab = tabs_tree[0].active_tab;

        if( e.target !== active_tab[0] && container){
            active_tab[0].classList.remove('active');
            active_tab[1].classList.remove('active');
            
            tabs_tree[0].active_tab = [e.target,container];
            e.target.classList.add('active');
            container.classList.add('active');
        }
    });

    // event to change default active tab
    defaultTabBtn.objs.defaultTab.addEventListener('click',function(e){
        e.stopPropagation();
        if(e.target.tagName.toLowerCase() === 'span'){
            localStorage.malr_dpt = e.target.innerText;
            defaultTabBtn.active_tab.classList.remove('active');
            defaultTabBtn.active_tab = e.target;
            e.target.classList.add('active');
        }
    });

    return tabs_tree[0];
}

// malr toggle sections function
function createToggleSections({sections,btnParent,storage}){
    // toggle sections button
    let toggleSectionBtn = newElement({e:'button',id:'toggleSectionBtn',txt:'Settings'});
    let SettingsContainer = newBlock('div#sectionSettings > {h3/Toggle_sections > span.close} + div.settings');
    btnParent ? btnParent.appendChild(toggleSectionBtn) : null;
    
    for(let prop in sections){
        let option = newElement({e:'div',txt:prop});
        SettingsContainer.objs.settings.appendChild(option);
        sections[prop].toggleBtn = option;
    }
    toggleSection();
    body.appendChild(SettingsContainer[0]);
    
    SettingsContainer[0].addEventListener('click',function(e){e.stopPropagation()});
    SettingsContainer.objs.close.addEventListener('click',function(){toggleSectionBtn.click()});
    toggleSectionBtn.addEventListener('click',function(e){
        e.stopPropagation();
        this.tempHandler ? null : this.tempHandler = function(){toggleSectionBtn.click()};
        if(toggleSectionBtn.state){
            toggleSectionBtn.state = false;
            document.removeEventListener('click',this.tempHandler);
            anime({
                targets: SettingsContainer[0],
                duration: 300,
                translateX: '120%',
                complete: function(){
                    SettingsContainer[0].classList.remove('active');
                    SettingsContainer[0].style.transform = '';
                },
                easing:'easeInOutCirc'
            });
        }
        else{
            toggleSectionBtn.state = true;
            SettingsContainer[0].classList.add('active');
            document.addEventListener('click',this.tempHandler);
        }
    })
    SettingsContainer.objs.settings.addEventListener('click',function(e){
        toggleSection(e.target.innerText);
    });

    function toggleSection(section){
        let userSettings = JSON.parse(localStorage[storage] || "{}");
        if(section) temp(section)
        else {for(let prop in sections){temp(prop)}}
        
        function temp(e){
            section ? userSettings[e] !== 'false' ? userSettings[e] = 'false' : userSettings[e] = 'true' : null;
            if(userSettings[e] !== 'false'){
                sections[e].toggleBtn.classList.add('active');
                sections[e].forEach(function(item){
                    if(item){
                        item.nodeType === 1 ? item.style.setProperty('display','') : 
                        (
                            item.history ? item.data = item.history : null
                        )
                    }
                })
            }
            else{
                sections[e].toggleBtn.classList.remove('active');
                sections[e].forEach(function(item){
                    if(item){
                        item.nodeType === 1 ? item.style.setProperty('display','none','important') : 
                        (
                            item.history ? null : item.history = item.data,
                            item.data = ''
                        )
                    }
                })
            }
            section ? localStorage[storage] = JSON.stringify(userSettings) : null;    
        }
    }
}