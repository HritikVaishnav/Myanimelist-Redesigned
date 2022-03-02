var body;
var rThis = this;
var docElem = document.documentElement;
var userList = false;
var flags = {};
var intersectObserver;
const observer = new Mutate([false,true,true]);
const observer2 = new Mutate([false,true,false]);
const pageURL = document.URL.split(/[/?]/);
const ad_css = "#tbl-next-up,.mal-ad-unit,.amazon-ads,.ad-sas,.mal-koukoku-unit{display:none !important}";

let themeName = localStorage.malr_theme;
if(themeName){
    if(themeName !== 'default') flags.customTheme = true;
} else {
    localStorage.malr_theme = themeName = 'default';
}

// function to manage loading
const loadbg_color = {'default':'#395693','dark':'#181c25','blackpearl':'#000','creamy':'#d5cd88'};
const loadBg = loadbg_color[themeName];
const defaultLoadingCss = `body{overflow:hidden!important}#load_bg{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:${loadBg};z-index:1000}#load_box{display:flex;position:fixed;align-items:center;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1001;height:calc(100vw / 5);max-height:150px}#load_box>img{min-width:0;height:100%}`;
function manageLoading(){
    if(isNaN(flags.loading)){
        const layout = newBlock('div#load_bg + {div#load_box > img.txt + img.gif} + style#load_style');
        layout.objs.txt.src = curl('images/logo2_white.svg');
        layout.objs.gif.src = curl('images/loading/'+anime.random(1,14)+'.gif');
        layout.objs.load_style.appendChild(document.createTextNode(defaultLoadingCss));

        docElem.appendChild(newFrag([layout[2],layout[0],layout[1]]));
        flags.loading = true;
        
        onDocumentReady(function () {
            if(flags.loading) manageLoading()
        })
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
const regx_filter = new RegExp('\/(animelist|mangalist|apiconfig)\/');
if(malr_enabled !== 'false' && document.URL.search(regx_filter) < 1){
    localStorage.malr_loading !== 'false' ? manageLoading() : null;
    
    // inserting style tag
    var mal_redesigned = newElement({e:'style', id:'mal_css'});
    var mal_color_palette = newElement({e:'style', id:'mal_color_palette'});
    var mal_color_template = newElement({e:'style', id:'mal_color_template'});
    var mal_ads = newElement({e:'style', id:'mal_ads_css'});

    // fetching and assigning css to style tags
    let toGet = ['ads','mal_redesigned','mal_color_template',themeName];
    chrome.storage.local.get(toGet, function(css){
        mal_redesigned.appendChild(document.createTextNode(css.mal_redesigned));

        // custom theme css
        if(flags.customTheme){
            mal_color_palette.appendChild(document.createTextNode(css[themeName]));
            mal_color_template.appendChild(document.createTextNode(css.mal_color_template));
            docElem.classList.add('customTheme')
        }

        // ads css
        if(localStorage.malr_ads === 'false'){
            mal_ads.appendChild(document.createTextNode(ad_css));
        }

        // logo url
        let originalLogo = curl('images/original_logo_txt.svg');
        mal_redesigned.sheet.insertRule('.link-mal-logo{background-image:url('+originalLogo+') !important}');
    });

    // appending style tags to document
    let frag = new DocumentFragment();
    frag.append(mal_redesigned,mal_color_template,mal_color_palette,mal_ads);
    if(!document.head){
        observer2.start(docElem,function(mutation){
            var node = mutation.addedNodes[0];
            if(node && node.tagName === 'HEAD'){
                docElem.appendChild(frag);
                observer2.stop();
                return true;
            }
        })   
    } else {
        docElem.appendChild(frag);
    }

    // identifying page type
    switch (pageURL[3]) {
        case 'anime':
            docElem.id = flags.activePage = "animePage";
            if(document.URL.search(/^https:\/\/.*?\/anime\/\d+\/?[\w-%]+(\/|\?.*|$)(stats.*|reviews.*|\w*)$/)>-1){
                MainTableIdentity("MainTable");
                flags.animePage = true;
                flags.animanga = true; softLoad(flags,mal_redesigned);
                if(pageURL[6] && pageURL[6].search(/q=|suggestion/) === -1){
                    flags.animePage = false;
                    docElem.className = 'animeTabs';
                }
            } else {
                if(document.URL.search(/episode\/\d+/) !== -1) MainTableIdentity("episodeTable");
            }
            break;
        case 'manga':
            docElem.id = flags.activePage = "mangaPage";
            pageURL[6] ? pageURL[6].search(/q=|suggestion/) === -1 ? docElem.className = 'mangaTabs' : flags.mangaPage = true : flags.mangaPage = true;
            MainTableIdentity("MainTable");
            if(pageURL[4] !== 'producer' && pageURL[4] !== 'magazine' && pageURL[4] !== 'genre'){
                flags.animanga = true; softLoad(flags,mal_redesigned);
            }
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
            flags.forumsPage = true;
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
            } else {
                docElem.id = flags.activePage = 'profilePage';
                flags.profilePage = true;
            }
            break;
        case 'recommendations.php':
            docElem.id = flags.activePage = "recommendationsPage";
            break;
        case 'reviews.php':
            docElem.id = flags.activePage = "reviewsPage";
            break;
        case 'myreviews.php':
            docElem.id = flags.activePage = "myreviewsPage";
            if(pageURL[4].startsWith('go=write&seriesid=')){
                docElem.id = 'reviewWritePage'
            }
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
                softLoad(flags,mal_redesigned);
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

    // changing layouts
    localStorage.malr_new_layout !== 'old' ? 
        (docElem.classList.add('newLayout'), flags.newLayout=true) : docElem.classList.add('oldLayout');
    if(!$cls('error404')[0]) {
        switch (flags.activePage) {
            case 'animePage':
                flags.animePage ? upgradeAnimanga(true) : upgradeAnimanga();
                break;
            case 'mangaPage':
                flags.mangaPage ? upgradeAnimanga(true) : upgradeAnimanga();
                break;
            case 'homePage':
                flags.homePage ? upgradeHomePage() : null;
                break;
            case 'profilePage':
                flags.profilePage ? upgradeProfile() : null;
                break;
            case 'forumPage':
                flags.forumsPage ? upgradeForum() : null;
                break;
        
            default:
                break;
        }
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

    // widget slides
    makeSliderFromSlideBlocks($cls('widget-slide-block'),true);
    makeSliderFromSlideBlocks($cls('js-auto-recommendation'),true);
    makeSliderFromSlideBlocks($cls('anime-slide-block'),false);
    function makeSliderFromSlideBlocks(slide_blocks,custom_btn_only){
        if(slide_blocks){
            fast4(0, slide_blocks.length,function(i){
                let interval = setInterval(function(){
                    if(slide_blocks[i].$e('.left')){
                        let btnBox = slide_blocks[i].$closest('.widget-header|.normal_header|h2',3);
                        if(btnBox.tagName === 'H2') {
                            let sibling = btnBox.previousElementSibling;
                            if(sibling && sibling.className === 'floatRightHeader'){
                                btnBox = btnBox.parentElement;
                            }
                        };
                        make_malr_slider({
                            list: slide_blocks[i].$e('.widget-slide') || slide_blocks[i].$e('.items') || slide_blocks[i].$e('.anime-slide'),
                            btnContainer: btnBox,
                            btns: {
                                right: cloneAndReplace(slide_blocks[i].$e('.right')),
                                left: cloneAndReplace(slide_blocks[i].$e('.left')),
                                removeDefault: custom_btn_only
                            },
                            iobserve: true
                        });
                        clearInterval(interval);
                    }
                },500);
            });
        }   
    }

    // scroll Top Btn
    new scrollToTopX();
    
    // extension menu
    if(navbar) extension_menu_init(navbar);

    // remove loading screen
    if(flags.loading){
        flags.loading = false;
        setTimeout(function() {
            manageLoading();
        },300)
    }

    // js-truncate-outer
    var truncate = $cls('js-truncate-outer');
    if(truncate){
        truncate.$loop(function(i){
            make_malr_expand_box({box:truncate[i]},true);
        })
    }

    // BBeditor
    if(localStorage.malr_editor !== 'false'){
        let textareas = $cls('textarea');
        if(textareas[0]){
            make_malr_bbeditor()
        }
    }

    // checking malr_sliders overflow
    setTimeout(function() {
        malr_slider_check_overflow();
    },500)

    // to do when document is completely loaded
    onDocumentReady(function(){

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
    let malrThemeMenu = "{div#malr_themes>div/Default+div/Dark+div/Blackpearl+div/Creamy}";
    let layoutMenu = "{div.layout>div/Layout+{ul>li/home_page+li/anime_page+li/profile_page}}";
    let actions = "{section.actions>div#support/support+div#github/github}+a#feedback/report_a_bug_or_give_feedback";
    let temp_query = `div#malr_menu>${malrToggleBtn}+{div.theme>div.current/Default+${malrThemeMenu}}+${layoutMenu}+{div.ads>div/Ads}+{div.loading>div/Loading}+{div.bbeditor>div/Editor}+${actions}`;
    let malr_menu = newBlock(temp_query);
    let extensionToggleBtn = malr_menu.objs.toggleMalr;
    let theme = malr_menu.objs.theme;
    let bbeditor = malr_menu.objs.bbeditor;
    let layout = malr_menu.objs.layout;
    let Ads = malr_menu.objs.ads;
    let loading = malr_menu.objs.loading;
    let malr_menu_btn = newBlock('div#malr_menu_btn>span.btn');
    malr_menu_btn[0].appendChild(malr_menu[0]);

    // syncing html with settings
    toggleExtension(); changeTheme(); layout_update(); 
    layout_pages(); toggleAds(); toggleLoading(); toggleEditor();

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
    function changeTheme(updateFlag,target){
        let temp = localStorage.malr_theme;
        updateFlag ? updateSettings() : updateHtml(temp);

        function updateHtml(theme){
            malr_menu.objs.current.innerText = theme;
            theme !== 'default' && theme !== 'undefined' ? 
                docElem.classList.add('customTheme') : docElem.classList.remove('customTheme');
        }

        function updateSettings() {
            let x = target.innerText.toLowerCase();
            if(x !== temp && !target.id){
                if(x !== 'default'){
                    get([x,'mal_color_template'],function(res){
                        mal_color_palette.appendChild(document.createTextNode(res[x]));
                        mal_color_palette.childNodes.length > 1 ? 
                            mal_color_palette.firstChild.remove() : null;
                        mal_color_template.childNodes.length > 0 ? 
                            null : mal_color_template.appendChild(document.createTextNode(res.mal_color_template));
                        mal_color_palette.disabled = false;
                        mal_color_template.disabled = false;
                    });
                } else {
                    mal_color_palette.disabled = true;
                    mal_color_template.disabled = true;
                }
                localStorage.malr_theme = x;
                updateHtml(x);
            }
            
        }
    }
    malr_menu.objs.malr_themes.addEventListener('click',function(e){changeTheme(true,e.target)});

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
                    updateSettings(e,['malr_new_profile_page','profilePage']);
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
        let style = document.getElementById("mal_ads_css");
        updateFlag ? temp !== 'false' ? localStorage.malr_ads = temp = 'false' : localStorage.malr_ads = temp = 'true' : null;
        temp !== 'false' ? Ads.classList.remove('ads-disabled') : Ads.classList.add('ads-disabled');
        if(updateFlag){
            if(temp !== 'false'){
                style.sheet.deleteRule(0);
            } else {
                style.sheet.insertRule(ad_css);
            }
        }
        docElem.classList.toggle('ads-disabled');
    }
    Ads.addEventListener('click',function(){toggleAds(true)});

    // toggle bbeditor
    function toggleEditor(updateFlag){
        let temp = localStorage.malr_editor;
        updateFlag ? temp !== 'false' ? localStorage.malr_editor = temp = 'false' : localStorage.malr_editor = temp = 'true' : null;
        temp !== 'false' ? bbeditor.classList.remove('editor-disabled') : bbeditor.classList.add('editor-disabled');
    }
    bbeditor.addEventListener('click',function(){toggleEditor(true)});

    // toggle loading
    function toggleLoading(updateFlag){
        let temp = localStorage.malr_loading;
        updateFlag ? temp !== 'false' ? localStorage.malr_loading = temp = 'false' : localStorage.malr_loading = temp = 'true' : null;
        temp !== 'false' ? loading.classList.remove('loading_disabled') : loading.classList.add('loading_disabled');
    }
    loading.addEventListener('click',function(){toggleLoading(true)});

    malr_menu.objs.github.onclick = function(){window.open("https://github.com/HritikVaishnav/Myanimelist-Redesigned")};
    malr_menu.objs.support.onclick = function(){window.open("https://hritikvaishnav.github.io/Project-Redesign/public/donation.html")};
    malr_menu.objs.feedback.onclick = function(){window.open("https://forms.gle/Sje1o5BX759VH5np6")};

    navbar.appendChild(malr_menu_btn[0]);
    return malr_menu_btn[0];
}

function upgradeHomePage(){
    if(flags.newLayout){
        if(localStorage.malr_new_home_page !== 'false'){
            docElem.classList.add('newHomepage');
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
                    friend_updates : $e('.friend_list_updates'),
                    clubs : $e('.clubs')
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

                        function eventHandler(event) {
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
                        }

                        temp.addEventListener('mouseover',function(event){
                            eventHandler(event);
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
            let top_anime_sections = $multiselect('.airing_ranking,.upcoming_ranking,.popular_ranking');
            let top_anime = newElement({e:'div',id:'top_anime_container'});
            top_anime_sections.forEach(function(item){
                item ? top_anime.appendChild(item.parentElement) : null
            })
            main_container.insertAdjacentElement('beforebegin',top_anime);
            make_malr_expand_box({box:top_anime});

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
    }
    let mxj = $e('.widget.mxj');
    if(mxj){make_malr_slider({list: mxj.lastElementChild, btnContainer: mxj.firstElementChild})}
    
    softLoad(flags,mal_redesigned);
}

function upgradeProfile(){
    let profile_about = $cls('user-profile-about')[0];
    if (profile_about && profile_about.scrollHeight < 47) {
        let txt = profile_about.innerText.replace(/[^\x00-\x7F]/g, "");
        !txt ? profile_about.classList.add("dnone") : null;
    }
    
    let favorites = $cls('user-favorites-outer')[0] || $cls('fav-slide-block');
    let favElems;
    // initilizing sliders for favorites
    if(favorites){
        if(favorites.length !== undefined){
            favElems = [];
            favorites.$loop(function(i){
                favElems.push(favorites[i].previousElementSibling,favorites[i]);
                make_malr_slider({
                    list: favorites[i].$e('.fav-slide'),
                    btnContainer: favorites[i].previousElementSibling,
                    iobserve: true,
                    nocls: true
                });
            });
        } else {
            let slide_outers = favorites.firstElementChild.children;
            slide_outers.$loop(function(i){
                make_malr_slider({
                    list: slide_outers[i].lastElementChild,
                    btnContainer: slide_outers[i].firstElementChild,
                    iobserve: true
                });
            });
        }

        let favmore = $cls('favmore')[0];
        if(favmore){
            make_malr_expand_box({box:favmore});
        }
    }
    
    if(flags.newLayout){
        if(localStorage.malr_new_profile_page !== 'false'){
            docElem.classList.add('newProfile');
            
            let stats = $id('statistics');
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
                'favorites':[favElems || favorites],
                'comments':[comments]
            },'about');
            $cls('content-container')[0].appendChild(tabs);
        }
    }
    
    setTimeout(function(){
        let badgeNum = document.querySelector("[href='http://www.mal-badges.net']");
        badgeNum ? badgeNum.previousElementSibling.id = "badgeNumber" : null;
    },1000);
}

function upgradeAnimanga(flagx){
    if(flags.animanga){
        // extraction of sections from right column
        let columns = $e('#MainTable').$e('tr').children;
        let h2_left = columns[0].$E('@h2');
        let h2_right = columns[1].$E('@h2');
        let sections_left = {};
        let sections_right = {};
        
        sections_right[flags.mangaPage ? 'Manga stats':'Anime stats'] = [$cls('anime-detail-header-stats')[0]];
        flags.mangaPage ? null : sections_right['Anime video'] = [$cls('anime-detail-header-video')[0]];
        h2_right.$loop(function(i){
            let temp = [];
            let helper = h2_right[i].nextElementSibling ? h2_right[i] : h2_right[i].parentElement;
            let headTxt = directTxt(h2_right[i]).match(/[A-Za-z].*[A-Za-z]+/,'')[0];
            // temp.push(helper);
            switch (headTxt) {
                case "Background":
                    temp = temp.concat(helper,selectTill(helper,{tag:'div'}))
                    break;
                case "Reviews":
                    h2_right[i].innerText = "User reviews";
                    h2_right[i].id = "reviews_head";
                    temp = temp.concat(helper,selectTill(helper,{tag:'div',class:['mt4','amazon-ads']}))
                    break;
                case "Recent News":
                    temp = temp.concat(helper,selectTill(helper,{tag:'br'}))
                    break;
                case "News":
                    temp = temp.concat(helper,selectTill(helper,{tag:'end'}))
                    break;
                case "Recommendations":
                    if(!flagx) temp = temp.concat(helper,selectTill(helper,{tag:'end'}))
                    else temp.push(helper,helper.nextElementSibling)
                    break;
                case "Related Clubs":
                    temp = temp.concat(helper,selectTill(helper,{tag:'end'}))
                    break;
                case "Characters":
                    if(!flagx) temp = temp.concat(helper,selectTill(helper,{tag:'end'}))
                    else temp.push(helper,helper.nextElementSibling)
                    break;
                case "More Info":
                    temp = temp.concat(helper,selectTill(helper,{tag:'end'}))
                    break;
                case "Recently Updated By":
                    temp = temp.concat(helper,selectTill(helper,{tag:'end'}))
                    break;
                case "Summary Stats":
                    temp = temp.concat(helper,selectTill(helper,{tag:'br'}))
                    break;    
                case "Episodes":
                    helper = helper.parentElement;
                    temp = temp.concat(helper,selectTill(helper,{tag:'br'}))
                    break;
                case "Promotions":
                    helper = helper.parentElement;
                    temp = temp.concat(helper,selectTill(helper,{tag:'br'}))
                    break;
                case "Characters & Voice Actors":
                    if(!flagx) temp = temp.concat(helper,selectTill(helper,{tag:'br'}))
                    else temp.push(helper,helper.nextElementSibling)    
                    break;
                case "Staff":
                    temp = temp.concat(helper,selectTill(helper,{tag:'br'}))
                    // else temp.push(helper,helper.nextElementSibling)    
                    break;
            
                default:
                    temp.push(helper,helper.nextElementSibling)
                    break;
            }
            sections_right[headTxt] = temp;
        });

        let tempBlock = sections_left['SocialBtns'] = [columns[0].$e('.icon-block')];
        sections_left['Image'] = [tempBlock[0].parentElement.firstElementChild];
        sections_left['Favorite'] = [$id('profileRows')];
        sections_left['NotifyBtn'] = [$id('notify-block')];
        sections_left['Addtolist'] = [$id('addtolist')];
        h2_left.$loop(function(i){
            let temp = [];
            let headTxt = h2_left[i].lastChild.data.match(/[A-Za-z].*[A-Za-z]+/,'')[0];
            temp.push(h2_left[i]);
            switch (headTxt) {
                case 'Edit Status':
                    temp = temp.concat(sections_left['Addtolist']);
                    headTxt = 'Addtolist';
                    break;
                case 'Information':
                    h2_left[i].id = "info_head";
                    h2_left[i].innerText = "Info";
                    temp = temp.concat(selectTill(h2_left[i],{tag:'h2'}));
                    break;
                default:
                    temp = temp.concat(selectTill(h2_left[i],{tag:'h2'}));
                    break;
            }
            sections_left[headTxt] = temp;
        });
        // console.log(sections_left,sections_right);
        if(flags.newLayout){
            if(localStorage.malr_new_anime_page !== 'false'){
                flags.newcurrent = true;
                docElem.classList.add('newAnimangaPage');
                columns[0].id='leftTableColumn';
                columns[1].id='rightTableColumn';
                sections_left['Image'][0].id='mainImage';

                let animanga_css = newElement({e:'style',id:'animanga_css'});
                mal_redesigned.insertAdjacentElement('afterend',animanga_css);
                get('animanga_css',function (css) {
                    animanga_css.appendChild(document.createTextNode(css.animanga_css));
                });

                let aboutStr = "{div.about>div#abouttop+{div#aboutcols>div#aboutleft+div#aboutright}}";
                let animanga = newBlock(`div#animanga>div#navigation+${aboutStr}+div#others+div#ads`);
                animanga.objs.navigation.$addChildren([
                    wrap(sections_left['Alternative Titles'],'section#alternativeTitles'),
                    $id('horiznav_nav'),
                    $e('.breadcrumb')
                ]);

                animanga.objs.abouttop.appendChild(wrap(sections_left['Information'],'section#aniinfo'));
                animanga.objs.aboutleft.appendChild(wrap([
                    wrap(sections_left['Image']),
                    wrap(sections_left['Addtolist'],'div#editStatusBlock'),
                    wrap(sections_left['NotifyBtn']),
                    wrap(sections_left['Favorite']),
                    wrap(sections_left['SocialBtns'])
                ],'section#mediabox'));
                animanga.objs.aboutright.$addChildren([
                    wrap(flags.animePage ? sections_right['Anime stats'] : sections_right['Manga stats'],'section#anistats'),
                    wrap(sections_right['Synopsis'],'section#description'),
                    wrap(sections_right['Background'],'section'),
                    wrap(sections_right['Episode Videos'],'section#episodeVideos'),
                    wrap(sections_left['External Links'],'section#externallinks'),
                    wrap(sections_right['Related Anime'] || sections_right['Related Manga'],'section#relatedanime')
                ]);

                animanga.objs.others.$addChildren([
                    wrap(sections_right['Opening Theme'],'section#opening'),
                    wrap(sections_right['Ending Theme'],'section#ending'),
                    wrap(sections_right['Characters & Voice Actors'],flagx?'section#actors':'section#actorstab'),
                    wrap(sections_right['Staff'] || sections_right['Characters'],flagx?'section#staff':'section#stafftab'),
                    wrap(sections_right['Reviews'],'section#reviews'),
                    wrap(sections_right['Recent News'],'section#news'),
                    wrap(sections_right['Recent Featured Articles'],'section#featured'),
                    wrap(sections_right['Recent Forum Discussion'],'section#discussion'),
                    wrap(sections_right['Recommendations'],flagx?'section#recommendations':'section#recommendationstab'),
                    wrap(sections_right['MALxJapan -More than just anime'],'section#mxj')
                ]);
                
                if(!flagx){
                    animanga.objs.navigation.firstElementChild.insertAdjacentElement('afterend',sections_left['Image'][0]);
                    animanga[0].classList.add('tabs');
                    animanga.objs.others.$addChildren([
                        wrap(sections_right['Episodes'],'section#episodes'),
                        wrap(sections_right['Promotions'],'section#promotions'),
                        wrap(sections_right['Summary Stats'],'section#summary'),
                        wrap(sections_right['Score Stats'],'section#score'),
                        wrap(sections_right['Recently Updated By'],'section#recentby'),
                        wrap(sections_right['News'],'section#tabnews'),
                        wrap(sections_right['Forum'],'section#forum'),
                        wrap(sections_right['Featured Articles'],'section#tabfeatured'),
                        wrap(sections_right['Related Clubs'],'section#clubs'),
                        wrap(sections_right['Pictures'],'section#pictures'),
                        wrap(sections_right['More Info'],'section#extrainfo')
                    ]);
                }

                animanga.objs.ads.$addChildren([
                    Array.from($cls('mal-ad-unit')),
                    $cls('amazon-ads')[0]
                ]);

                $id('content').insertAdjacentElement('beforebegin',animanga[0]);

                setTimeout(function(){
                    make_malr_expand_box({box:$id('description')});
                    make_malr_expand_box({box:$id('reviews')});
                    make_malr_expand_box({box:$id('actorstab')});
                    make_malr_expand_box({box:$id('stafftab')});
                    make_malr_expand_box({box:$id('recommendationstab')});

                    let actorList = $e('@#actorstab tbody tbody');
                    actorList.$loop(function(i){
                        make_malr_slider({
                            list: actorList[i],
                            btnContainer: actorList[i].parentElement,
                            nocls: true,
                            grid: false,
                            iobserve: true
                        })
                    });

                    let viewOpEdMore = $cls('js-anime-toggle-op-ed-button')[0];
                    if(viewOpEdMore){
                        $id('ending').appendChild(viewOpEdMore);
                    }

                    let titles = $id('alternativeTitles');
                    titles ? make_malr_slider({
                        list: titles, nocls: true, btnContainer: titles, scroll: false, grid: false, iobserve: true
                    }) : null

                    if((pos=$e('.user-status-block')) && (atl=$id('addtolist'))){
                        let editDetails = $id('addtolistresult') || atl.$e('small');
                        if(editDetails){
                            editDetails.id = "editDetailsBtn";
                            pos.appendChild(editDetails);
                        }
                    }

                    if(!flagx){
                        let infobar = $id('aniinfo');
                        infobar ? make_malr_slider({
                            list: infobar, nocls: true, btnContainer: infobar.parentElement, scroll: false, grid: false
                        }) : null
                    }

                    let charlist = $cls('detail-characters-list');
                    charlist.$loop(function(i){
                        let temp = Array.from(charlist[i].lastElementChild.children);
                        charlist[i].firstElementChild.$addChildren(temp);
                        make_malr_slider({
                            list: charlist[i].firstElementChild,
                            btnContainer: charlist[i].previousElementSibling,
                            nocls: true,
                            iobserve: true
                        });
                    });
                },1000);
            }
        }

        // minor fixes
        if(flagx){
            let recommendations = sections_right['Recommendations'];
            recommendations ? recommendations[1].classList.add('w-100') : null;

            // anime-trailer-reposition
            var trailer = $cls('anime-detail-header-video')[0];
            if(trailer){
                var temp1 = $e("[itemprop='description']");
                temp1.previousElementSibling.insertAdjacentElement('beforebegin',trailer);
                trailer.classList.add('repositioned');
            }

            // mal sync related fix
            let ruby_pos_ref = $id('reviews_head');
            let ryby_container = newBlock('section#ruby>h2.dnone/Reviews')[0];
            if(ruby_pos_ref){
                ruby_pos_ref = $id('reviews') || (ruby_pos_ref.parentElement.tagName ==='div' ? ruby_pos_ref.parentElement : ruby_pos_ref);
                ruby_pos_ref.insertAdjacentElement('beforebegin',ryby_container);
            }
            // --------------------

            // opening-ending btns
            let previewAudio = $e('@.oped-preview-button+audio');
            previewAudio.forEach(function(e){
                let ui = e.previousElementSibling;
                e.onplay = function(){ui.classList.add('playing')};
                e.onabort = function(){ui.classList.remove('playing')};
                e.onpause = function(){ui.classList.remove('playing')};
            })

             // creating toggle menu
            createToggleSections({
                sections:Object.assign(sections_right,sections_left), 
                btnParent:$cls('header-right')[0], 
                storage: flags.mangaPage ? 'malr_mpss' : 'malr_apss'
            });
        }

        // mal sync related fix
        let web_links_ref = $id('info_head');
        if(web_links_ref){
            web_links_ref = (flagx ? $id('externallinks') : $id('aboutcols')) || web_links_ref;
            let appendType = web_links_ref.id !== 'info_head' ? 'afterend' : 'beforebegin';
            let links_container = newBlock('section#webLinks.dnone>div.links+h2.dnone/Information')[0];
            web_links_ref.insertAdjacentElement(appendType,links_container);
            observer.start(links_container,function(mutation){
                if(mutation.addedNodes[0]){
                    observer.stop();
                    let links = [];
                    let temp = [];
                    let nodesArray = Array.from(mutation.addedNodes);
                    nodesArray.forEach(function(e){
                        if(e.tagName === 'BR'){
                            e.remove();
                            links.push(temp);
                            temp = [];
                        } else {
                            temp.push(e);
                        }
                    });
                    links = links.map(function(e){
                        return wrap(e,'div.web_link');
                    });
                    let fragment = new DocumentFragment();
                    fragment.$addChildren(links);
                    links_container.firstElementChild.appendChild(fragment);
                    links_container.classList.remove('dnone');
                    make_malr_slider({
                        list: links_container.firstElementChild,
                        btnContainer: links_container,
                        nocls: true,
                        scroll: false,
                        iobserve: true
                    })
                }
            })
        }
        // -------------------

        let jsBox = $cls('outside-region');
        if(jsBox[0]){
            jsBox.$loop(function(i){
                make_malr_expand_box({box:jsBox[i]});
            })
        }

        // softload handler
        setTimeout(function(){
            softLoad(flags,mal_redesigned);
        },200);
    }
}

function upgradeForum(){
    if(pageURL[5] && pageURL[5].startsWith('topicid=')){
        // create toggle btn
        let actions = newBlock('div#fcBlock>button.btn/Compact_Mode+{span.dropdown>{div#fcDrop>div.dpBtn/Profile_Image_:}}');

        actions.objs.btn.addEventListener('click',function(){
            toggleForumCompact(this,true);
        });
        actions.objs.dpBtn.addEventListener('click',function(){
            toggleForumCompact(this,true);
        });
        
        let tempHandler =  function(){actions.objs.dropdown.click()};
        actions.objs.fcDrop.addEventListener('click',function(e){e.stopPropagation()});
        actions.objs.dropdown.addEventListener('click',function(e){
            e.stopPropagation();
            if(this.dropdown){
                this.dropdown = false;
                document.removeEventListener('click',tempHandler);
                actions.objs.fcDrop.style.display="";
            } else {
                this.dropdown = true;
                document.addEventListener('click',tempHandler);
                actions.objs.fcDrop.style.display="block";
            }
        });

        function toggleForumCompact(btn,flag){
            let x = btn.tagName === 'BUTTON' ? ['malr_forum_compact','forumCompact'] : ['malr_forum_img','imgFull'];
            let temp = localStorage[x[0]];
            flag ? temp !== 'false' ? localStorage[x[0]] = temp = 'false' : localStorage[x[0]] =  temp = 'true' : null;
            temp !== 'false' ? 
                ($id('contentWrapper').classList.add(x[1]), btn.classList.add('on')) 
                : ($id('contentWrapper').classList.remove(x[1]), btn.classList.remove('on'));
        }
        $id('header-menu').appendChild(actions[0]);
        toggleForumCompact(actions.objs.btn); toggleForumCompact(actions.objs.dpBtn);
    }
}

// malr slider functions
function make_malr_slider({list, btnContainer, grid, scroll, btns, nocls, iobserve}){
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
    if(!nocls){
        list.classList.add('sliderList');
        list.parentElement.classList.add('malrSlider');
    }
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
    list.actions = actions[0];
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
    });
    if(iobserve){
        let observer = iObserver(function(e){
            if(e.isIntersecting){
                malr_slider_check_overflow({'list':e.target,'actions':e.target.actions});
                observer.unobserve(e.target);
            }
        },{threshold:0.25},'slider_iObserver');
        observer.observe(list);
    }
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
        if(slider.list.childElementCount === 0){
            slider.list.classList.add('slidingDisabled');
            slider.actions.classList.add('nooverflow');
            slider.list.parentElement.classList.add('nochild');
        }
        else{
            if(slider.list.offsetWidth !== 0){
                if(slider.list.scrollWidth > slider.list.offsetWidth){
                    slider.list.classList.remove('slidingDisabled');
                    slider.actions.classList.remove('nooverflow');
                    helperClass ? slider.actions.classList.remove(helperClass):null;
                }
                else{
                    slider.list.classList.add('slidingDisabled');
                    slider.actions.classList.add('nooverflow')
                    helperClass ? slider.actions.classList.add(helperClass):null;
                }
            }
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
        if(container.childElementCount === 0){
            container.appendChild(newBlock('h3.emptySection/This_section_is_empty')[0]);
        }
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
            let current = sections[e];
            section ? userSettings[e] !== 'false' ? userSettings[e] = 'false' : userSettings[e] = 'true' : null;
            if(userSettings[e] !== 'false'){
                current.toggleBtn.classList.add('active');
                if(flags.newcurrent){
                    current[0] ? current[0].parentElement.style.setProperty('display','') : null;
                }
                else{
                    current.forEach(function(item){
                        if(item){
                            item.nodeType === 1 ? item.style.setProperty('display','') : 
                            (
                                item.history ? item.data = item.history : null
                            )
                        }
                    })
                }
            }
            else{
                current.toggleBtn.classList.remove('active');
                if(flags.newcurrent){
                    current[0] ? current[0].parentElement.style.setProperty('display','none','important') : null;
                }
                else{
                    current.forEach(function(item){
                        if(item){
                            item.nodeType === 1 ? item.style.setProperty('display','none','important') : 
                            (
                                item.history ? null : item.history = item.data,
                                item.data = ''
                            )
                        }
                    })
                }
            }
            section ? localStorage[storage] = JSON.stringify(userSettings) : null;    
        }
    }
}

// malr expand container function
function make_malr_expand_box({box,maxH},fixTruncate){
    if(box){
        let btnExpand, maxHeightDefault;
        fixTruncate ? null : (
            maxH ? maxH !== 'default' ? maxHeightDefault = maxH : maxHeightDefault = 250 : null,
            btnExpand = newElement({e:'div',cls:'malr-expand-btn'}),
            box.appendChild(btnExpand)
        )
        anime.set(box,{maxHeight: maxHeightDefault, transition: 'none'});

        box.addEventListener('click', function(e){
            btnExpand ? null : btnExpand = box.$e('.btn-truncate');
            maxHeightDefault ? null : maxHeightDefault = box.offsetHeight;
            if(e.target === btnExpand){
                e.stopPropagation();
                let scrollHeight = box.scrollHeight; 
                let btnHeight = btnExpand.offsetHeight;
                let temp;
                if(btnExpand.state){
                    anime.set(box,{maxHeight: scrollHeight, paddingBottom: 0});
                    temp = maxHeightDefault;
                } else {
                    anime.set(box,{paddingBottom: btnHeight});
                    temp = scrollHeight + btnHeight;
                }
                anime({
                    targets: box,
                    maxHeight: temp,
                    duration: 500,
                    easing: 'easeOutSine',
                    complete: function(){
                        btnExpand.classList.toggle('open');
                        if(!btnExpand.state){
                            anime.set(box,{maxHeight: 50000});
                            btnExpand.state = true;
                        }
                        else{
                            btnExpand.state = false;
                        }
                    }
                })
            }
        },true)

        let observer = iObserver(function(e){
            if(e.isIntersecting){
                let btn = e.target.$e('.btn-truncate') || e.target.$e('.malr-expand-btn');
                if(btn){
                    e.target.scrollHeight <= e.target.clientHeight ? 
                        btn.style.setProperty('display','none','important')
                        : btn.style.display = ""
                    observer.unobserve(e.target);    
                }
            }
        },{threshold:0.25},'expandBox_iObserver');
        observer.observe(box);
    }
}

// malr initlialize bbeditor
function make_malr_bbeditor(){
    // adding bbcode editor
    let script = newElement({e:'script',src:curl('bbeditor/wysibb.min.js')});
    let script2 = newElement({e:'script',src:curl('bbeditor/wysibb.malr.js')});
    let stylesheet = newElement({e:'link',rel:'stylesheet'});
    let stylesheet2 = stylesheet.cloneNode();
    stylesheet.href = curl('bbeditor/theme/default/wbbtheme.min.css');
    stylesheet2.href = curl('bbeditor/theme/default/wysibb.malr.min.css');
    document.head.appendChild(newFrag([script,stylesheet,stylesheet2,script2]));
}