// Author : Hritik Vaishnav
// LinkedIn : https://in.linkedin.com/in/hritik-vaishnav

Node.prototype.$e = $e;
Node.prototype.$E = $E;
Node.prototype.closestX = closestX;
Node.prototype.$cs = $cs;
Node.prototype.$s = $s;
Node.prototype.$a = $a;
Node.prototype.$evt = $evt;
Node.prototype.toggleX = toggleX;
Node.prototype.checkOverflowX = checkOverflowX;

//function definations----
//new element creation function
var newElement = function (props) {
    var elem = document.createElement(props.e);
    props.id ? elem.id = props.id: null;
    props.cls ? elem.className = props.cls: null;
    props.link ? elem.href = props.link: null;
    props.rel ? elem.rel = props.rel: null;
    props.src ? elem.src = props.src: null;
    props.txt ? elem.innerText = props.txt: null;
    props.evt ? elem.addEventListener(props.evt,props.fn) : null;
    return elem;
}

//search elem
function $id(e){
    return document.getElementById(e);
}
function $cls(e){
    return document.getElementsByClassName(e);
}
function $tag(e){
    return document.getElementsByTagName(e);
}
function $E(elem,index){
    var parent = this === window ? document : this;
    switch (elem[0]) {
        case '#':
            return parent.getElementById(elem.substr(1));
        case '.':
            if(index) return parent.getElementsByClassName(elem.substr(1))[index]
            else return parent.getElementsByClassName(elem.substr(1));
        default:
            if(index) return parent.getElementsByTagName(elem)[index]
            else return parent.getElementsByTagName(elem);
    }
}
function $e(elem){
    var parent = this === window ? document : this;
    if(elem[0] === '@'){
        var temp = elem.substr(1)
        return parent.querySelectorAll(temp);
    }
    else{
        return parent.querySelector(elem);
    }
}

// onscroll
function $onscroll({scrolldown,scrollup}){
    window.scrollPositionY = window.scrollY;
    window.addEventListener('scroll',function(event){
        var temp = window.scrollY;
        if(scrollPositionY != temp){
            if(scrollPositionY < temp){
                scrolldown(temp);
            }
            else{
                scrollup(temp);
            }
            scrollPositionY = temp;
        }
    })
}

//fast for
function fast4(start,end,callback){
    for(var i=start; i<end; i++){
        callback(i);
    }
}

//styling of element
var styleDict = {h:'height',w:'width',c:'color',bg:'background',bgc:'background-color',
        f:'font',t:'top',b:'bottom',r:'right',l:'left',d:'display',tr:'transform',
        ts:'transition',br:'border',brs:'border-radius',fs:'font-size',fw:'font-weight',
        a:'animation',ad:'animation-duration',v:'visibility',maxh:'max-height',minw:'max-width',
        minh:'min-height',minw:'min-width',p:'padding',pt:'padding-top',pb:'padding-bottom',
        pr:'padding-right',pl:'padding-left',m:'margin',mt:'margin-top',mb:'margin-bottom',
        mr:'margin-right',ml:'margin-left',of:'overflow',ofy:'overflow-y',ofx:'overflow-x',
        bgp:'background-position',bgpx:'background-position-x',bgpy:'background-position-y'}
function $s(styles,num) {
    var elem  = this;
    var temp = styles.split(';');
    if(temp[0][0] === '?'){
        var result=[];
        fast4(0,temp.length,function(i){
            var value = elem.style.getPropertyValue(styleDict[temp[i].substr(1)]);
            if(num){
                var z = parseInt(value);
                if(!isNaN(z)){
                    value = z;
                }
            }
            result.push(value);        
        });
        return result.length < 2 ? result[0] : result;
    }
    else{
        fast4(0,temp.length,function(i){
            var z = temp[i].match(/[!]?(.*)[:](.*)/);
            
            if(temp[i][0] === '!') elem.style.setProperty(styleDict[z[1]],z[2],'important');
            else elem.style.setProperty(styleDict[z[1]],z[2]);
        });
        return elem;
    }
}

//manipulating stylesheet
function addCSSRuleX(sheet, selector, rules, index) {
    index = index !== undefined ? index : length();
	if(sheet.insertRule) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
	else if(sheet.addRule) {
		sheet.addRule(selector, rules, index);
    }
    function length(){
        if(sheet.cssRules) return sheet.cssRules.length
        else return sheet.rules.length;
    }
}
function rmCssRuleX([sheet,rule],index) {
    var rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
    index = index !== undefined ? index : findIndex();
    if(index !== null){
        sheet.deleteRule ? sheet.deleteRule(index) : sheet.removeRule(index);
    }
    else{
        throw "No such rule exist";
    }
    function findIndex(){
        for(var i=0; i < rules.length; i++){
            if(rules[i].selectorText === rule)
                return i
        }
        return null;
    }
}

//get attribute value
function $a(attribute,callback){
    var elem  = this;
    var temp = attribute.split(',');
    if(temp[0][0] === '?'){
        var result=[];
        fast4(0,temp.length,function(i){
            var value = elem.getAttribute(temp[i].substr(1));
            result.push(value);        
        });
        return result.length < 2 ? result[0] : result;
    }
    else if(callback){
        elem[attribute+'_callback'] = callback;
        elem.setAttribute(attribute,'this.'+attribute+'_callback()');
    }
    else{
        fast4(0,temp.length,function(i){
            var index = temp[i].indexOf(':');
            elem.setAttribute(temp[i].substr(0,index),temp[i].substr(index+1));
        });
        return elem;
    }
}

//string dom maker
function newBlock(data){
    var callbackCode = [], dom = null, tree;
    if(data.indexOf('{') > -1){
        data = data.replace(/ /g,'');
        var pairs = findBracketPairs(data,'{','}');
        var temp = 1000;
        for(var i=pairs.length-1; i>-1; i--){
            if(pairs[i][1] < temp){
                temp = pairs[i][0];
                var str = data.substring(pairs[i][0],pairs[i][1]+1);
                callbackCode.push(str);
                data = data.replace(str,'callback');
            }
        }
        tree = data.split('>');
    }
    else{
        tree = data.replace(/ /g,'').split('>');
    }
    for(var i=0; i<tree.length; i++){
        var block = createBlock(tree[i]);
        dom === null ? dom=block : block.map(function(item){
            dom[dom.length-1].append(item);
        });
    }
    return dom;
    function createBlock(block){
        var temp = block.split('+');
        var elements = [];
        for(var i=0; i<temp.length; i++){
            if(temp[i] === 'callback'){
                var str = callbackCode.pop();
                var code = str.substring(1,str.length-1);
                var output = newBlock(code);
                output.length > 1 ? null:output = output[0];
                elements.push(output);
            }
            else{
                var element = create(temp[i]);
                elements.push(element);
            }
        }
        return elements;
    }
    function create(elem){
        var temp = elem.replace(/[#/]/g,' ').replace('.',' ').split(" ");
        var tag = temp[0];
        var txt = elem.search('/') > -1 ? temp[temp.length-1].replace(/[_]/g,' '):null;
        var id = elem.search('#') > -1 ? temp[1] :null;
        var classs = elem.search('[.]') > -1 ? (id ? temp[2] : temp[1]).replace(/[.]/g,' '):null;
        var e  = newElement({e:tag,cls:classs,id:id,txt:txt});
        return e;
    }
}

//finding bracket pairs indexs
function findBracketPairs(str,o,c){
    var open = []
    var pairs = [];
    for(var i=0; i<str.length;i++) {
        if (str[i] === o) open.push(i);
        else if(open.length > 0){
            if(str[i] === c){
                    var a = open.pop();
                    pairs.push([a,i]);
            }
        }
    }
    return pairs;
}

//finding the closest elem
function closestX(data){
    var temp = data;
    typeof data === 'object' ? null : (function(){
        var temp2 = data.indexOf('.');
        if(temp2 < 0) data = [temp];
        else data = [temp.substr(0,temp2),temp.substr(temp2+1).replace('.',' ')];
    })();
    return check(this);
    
    function check(e){
        if(checkName(e)){ return e }
        else{ 
            var p = e.parentElement;
            if(p !== null) return check(p)
            else return undefined;
        };
    } 
    function checkName(e){
        if(data[0]){
            if(e.tagName.toLowerCase() === data[0]){
                if(data[1])  return checkClass(e);
                else return true;
            }
            else return false;
        }
        else return checkClass(e);
    }
    function checkClass(e){
        var cls = data[1];
        if(e.className.search(cls) > -1) return true;
        else return false;
    }
}

//getting computed style
function $cs(props,num){
    var output=[];
    var elem = this;
    props = props.split(',');
    fast4(0,props.length,function(i){
        var value = window.getComputedStyle(elem,null).getPropertyValue(styleDict[props[i]]);
        if(num){
            var z = parseInt(value);
            if(!isNaN(z)){
                value = z;
            }
        }
        output.push(value);
    });
    return output.length < 2 ? output[0] : output;
}

//popup event listners
class ClosePopUp{
    constructor(data){
        this.elem = data.e;
        this.outer = data.o;
        this.flag = false;
        this.fn1 = function(event){event.stopPropagation()};
        this.fn2 = function(event){data.fn(event)};
    }

    setListner(){
        this.elem.addEventListener('click',this.fn1);
        this.outer.addEventListener('click',this.fn2);
    }

    rmListners(){
        this.elem.removeEventListener('click',this.fn1);
        this.outer.removeEventListener('click',this.fn2);
    }
}

// open box function
function toggleBox(target,props,dflag,state){
    var e; 
    typeof target === 'string' ? e = document.querySelector(target):e = target;
    var status = e.toggleBoxData ? e.toggleBoxData.flag : undefined;
    status === undefined ? state ? setId(state) : setId() : null;
    if(props){
        props.s ? null : props.s ='fadeIn';
        props.e ? null : props.e ='fadeOut';
        props.t ? null : props.t =400;
    } 
    else{
        props.s ='fadeIn';
        props.e ='fadeOut';
        props.t =400;
    }
    e.style.animationDuration = props.t+'ms';

    if(dflag){
        if(status){
            e.className = e.toggleBoxData.cls + ' ' + props.e;
            setTimeout(function(){
                e.$s("d:none;ad:");
                e.className = e.toggleBoxData.cls;
                e.toggleBoxData.flag = false;
            },props.t-10);
        }
        else{
            e.className += ' ' +props.s;
            e.$s("d:"+props.d);
            e.toggleBoxData.flag = true;
        }
    }
    else{
        if(status){
            e.className = e.toggleBoxData.cls + ' ' + props.e;
            setTimeout(function(){
                e.$s("v:hidden;ad:");
                e.className = e.toggleBoxData.cls;
                e.toggleBoxData.flag = false;
            },props.t-10);
        }
        else{
            e.$s("v:visible");
            e.className += ' ' +props.s;
            e.toggleBoxData.flag = true;
        }
    }

    function setId(state){
        e.toggleBoxData = {};
        e.toggleBoxData.cls = e.className;
        if(state) { 
           if(state='enter') {e.toggleBoxData.flag = false; status = false}
           else {e.toggleBoxData.flag = true; status = true} 
        }
        else if(e.$cs('d') !== "none"){
            if(e.$cs('v') !== "hidden") { e.toggleBoxData.flag = true; status = true }
            else { e.toggleBoxData.flag = false; status = false }
        }
        else{
            e.toggleBoxData.flag = false; status = false;
        }
    }
}

//setpop function
function setPopUp({tar,ignore,out,btn,props,dflag},bodyOverflowFlag){
    tar = typeof tar === 'string' ? $e(tar) : tar;
    fast4(0,btn.length,function(i){
        btn[i] = typeof btn[i] === 'string' ? $e(btn[i]) : btn[i];
        btn[i].addEventListener('click',toDo);
    });
    var obj = ignore ? new ClosePopUp({e:ignore,o:out,fn:toDo}) : new ClosePopUp({e:tar,o:out,fn:toDo});
    function toDo(event){
        event.stopPropagation();
        bodyOverflowFlag ? document.body.toggleX('s.of','hidden') : null;
        dflag ? toggleBox(tar,props,dflag) : toggleBox(tar,props);
        if(obj.flag){
            obj.rmListners();
            obj.flag = false;
        }
        else{
            obj.setListner();
            obj.flag = true;
        }
    }
}

//add event listner
class listnerObj{
    constructor(type,fn,elem,name,capture){
        this.temp = 1;
        this.callbacks={};
        this.captureFlags={};
        name ? null : name='fn' + this.temp;
        capture ? this.captureFlags[name]=true : this.captureFlags[name]=false;
        this.callbacks[name] = fn;
        this.type = type;
        this.elem = elem;
    }

    add(fn,name,capture){
        name ? null : name='fn'+this.temp + 1;
        capture ? this.captureFlags[name]=true : this.captureFlags[name]=false;
        this.callbacks[name] = fn;
    }

    rm(fn){
        var target = this.elem;
        var functions = this.callbacks;
        var type = this.type;
        var captureFlags = this.captureFlags;
        if(!fn){
            var k = keys(functions);
            fast4(0,k.length,function(i){
                temp(type,functions[k[i]],captureFlags[k[i]])
            });
        }
        else{
            fn = fn.split(',');
            fast4(0,fn.length,function(i){
                temp(type,functions[fn[i]],captureFlags[fn[i]])
            });
        }

        function temp(type,fn,capture){
            if(capture) target.removeEventListener(type,fn,capture)
            else target.removeEventListener(type,fn);
        }
    }
}

function $evt(type,callback,name,capture){
    var elem = this;
    elem[type+'evt'] ? elem[type+'evt'].add(callback,name,capture):
                        elem[type+'evt'] = new listnerObj(type,callback,elem,name,capture);

    capture ? elem.addEventListener(type,callback,true):
                elem.addEventListener(type,callback);
}

//check if elem is in overflow state
function checkOverflowX(){
    var elem = this;
    var padding = elem.$cs('pt',true) + elem.$cs('pb',true);
    var height = elem.offsetHeight;
    var scrHeight = elem.scrollHeight;
    if(scrHeight > padding + height) return true;
    else return false;
}

function toggleX(prop,value){
    var elem = this;
    var cvalue,property,temp;
    switch (prop[0]) {
        case 's':
            temp = prop.split('.')[1];
            property = temp[0] === '!' ? styleDict[temp.substr(1)] : styleDict[temp];
            var oldValue = 'old'+property.replace('-','_');
            elem.style[property] ? cvalue = elem.style[property] : cvalue="";
            elem[oldValue] !== undefined ? null : elem[oldValue] = cvalue;
            if(temp[0] === '!'){
                if(typeof value === 'object'){
                    if(cvalue === value[0]) elem.style.setProperty(property,value[1],'important');
                    else elem.style.setProperty(property,value[0],'important');
                }
                else{
                    if(cvalue === value) elem.style.setProperty(property,elem[oldValue],'important');
                    else elem.style.setProperty(property,value,'important');
                }
            }
            else{
                if(typeof value === 'object'){
                    if(cvalue === value[0]) elem.style.setProperty(property,value[1]);
                    else elem.style.setProperty(property,value[0]);
                }
                else{
                    if(cvalue === value) elem.style.setProperty(property,elem[oldValue]);
                    else elem.style.setProperty(property,value);
                }
            }
            break;
    
        case 't':
            cvalue = elem.innerText;
            elem.oldText ? null : elem.oldText = cvalue;
            if(typeof value === 'object'){
                if(cvalue === value[0]) elem.innerText = value[1];
                else elem.innerText = value[0];
            }
            else{
                if(cvalue === value) elem.innerText = elem.oldText;
                else elem.innerText = value;
            }
            break;

        case 'a':
            property = prop.split('.')[1];
            cvalue = elem.getAttribute(property);
            elem['old'+property] ? null : elem['old'+property] = cvalue;
            if(typeof value === 'object'){
                if(cvalue === value[0]) elem.setAttribute(property,value[1]);
                else elem.setAttribute(property,value[0]);
            }
            else{
                if(cvalue === value) elem.setAttribute(property,elem['old'+property]);
                else elem.setAttribute(property,value);
            }
            break;
            
        case 'c':
            cvalue = elem.className;
            elem.oldClass ? null : elem.oldClass = cvalue;
            if(typeof value === 'object'){
                if(cvalue === elem.oldClass+' '+value[0]) elem.className = elem.oldClass+' '+value[1];
                else elem.className = elem.oldClass+' '+value[0];
            }
            else{
                if(cvalue.search(value) > -1){ elem.classList.remove(value) }
                else{ elem.classList.add(value) }
            }
            break;        

        default:
            break;
    }
}

//basic image viewer
class imageViewerX{
    constructor(images){
        this.imgList = typeof images === 'object' ? images : $E(images);
        this.activeImg = null;
        this.status = false;
        this.data = {};
        this.constructViewer(this);
    }

    constructViewer(viewer){
        var htmlBlock = newBlock("div#imageViewerX > {span.previous > i.iconx-leftBig} + {span.next > i.iconx-rightBig} + {span.close > i.iconx-close}")[0];
        var prevBtn = viewer.prevBtn = htmlBlock.$e('.previous');
        var nextBtn = viewer.nextBtn = htmlBlock.$e('.next');
        var closeBtn = viewer.nextBtn = htmlBlock.$e('.close');
        prevBtn.$evt('click',function(event){viewer.switchImg(event,'previous')});
        nextBtn.$evt('click',function(event){viewer.switchImg(event,'next')});
        closeBtn.$evt('click',function(event){viewer.closeImg(event)});
        document.body.appendChild(htmlBlock);
        viewer.e = htmlBlock;
        viewer.setEvents(viewer);
    }

    setEvents(viewer){
        var list = viewer.imgList;
        fast4(0,list.length,function(i){
            viewer.data['image'+i] = {
                src: list[i].src,
                id: i,
                container: null
            }
            list[i].$a('data-imgViewerX:'+i);
            list[i].$evt('click',function(event){
                viewer.openImg(event);
            },'imgViewer'+i)
        })
    }

    toggleViewer(){
        if(this.status){
            this.status = false;
        }
        else{
            this.status = true;
        }
        toggleBox(this.e,{s:'fadeIn',e:'fadeOut',t:600,d:'flex'},true);
    }
    
    openImg(event,imgNum,switchFlag,direction){
        event.stopPropagation();
        this.status ? null : this.toggleViewer();
        var viewer = this;
        var currentImg = viewer.activeImg ? viewer.data['image'+viewer.activeImg].container : null;
        var srcImg =  imgNum !== undefined ? viewer.imgList[imgNum] : event.target;
        var id = viewer.activeImg = imgNum ? imgNum : srcImg.$a('?data-imgViewerX');
        if(viewer.data['image'+id].container === null){
            var img = newElement({e:'img',src:srcImg.src,cls:'image'});
            viewer.data['image'+id].container = img;
            viewer.e.insertBefore(img,viewer.prevBtn);
            toggle(img);
        }
        else{
            var img = viewer.data['image'+id].container;
            toggle(img);
        }

        function toggle(img){
            if(switchFlag){
                if(direction){
                    currentImg ? toggleBox(currentImg,{e:'fadeOutRight',t:500,d:'block'},true):null;
                    toggleBox(img,{s:'fadeInLeft',t:500,d:'block'},true);
                }
                else{
                    currentImg ? toggleBox(currentImg,{e:'fadeOutLeft',t:500,d:'block'},true):null;
                    toggleBox(img,{s:'fadeInRight',t:500,d:'block'},true);
                }
            }
            else{
                toggleBox(img,{s:'fadeInDown',t:500,d:'block'},true);
            }
        }
    }
    
    closeImg(event){
        this.toggleViewer();
        var img = this.data['image'+this.activeImg].container;
        toggleBox(img,{e:'fadeOutDown',t:500,d:'block'},true);
    }

    switchImg(event,type){
        if(type === 'next'){
            var newId = parseInt(this.activeImg) + 1;
            newId >= this.imgList.length ? null : this.openImg(event,newId,true);
        }
        else{
            var newId = parseInt(this.activeImg) - 1;
            newId <= -1 ? null : this.openImg(event,newId,true,'previous');
        }
    }
}

//ScrollToTop
class scrollToTopX{
    constructor(){
        this.e = newBlock("span#scrollTopX > i.iconx-up")[0];
        this.flag = false;
        this.setListner();
    }

    setListner(){
        var rThis = this;
        document.body.appendChild(rThis.e);
        rThis.e.$evt('click',function(event){
            window.scroll({top:0,behavior:'smooth'});
        },'scrollTopBtn');
        $evt('scroll',function(event){
            if(window.scrollY > 150){
                if(rThis.flag){}
                else{ rThis.e.classList.add('active'); rThis.flag = true }
            }
            else{
                if(rThis.flag){ rThis.e.className='scrollTopX'; rThis.flag = false }
                else{}
            }
        },'scrollToTopX');
    }
} 

//CustomCursor
class customCursorX{
    constructor(cursor,elems){
        this.elemList = typeof elems === 'object' ? elems : $E(elems);
        this.cursor = typeof cursor === 'object' ? cursor : newBlock(cursor)[0];
        this.setListners();
    }

    setListners(){
        var elems = this.elemList;
        var cursor = this.cursor;
        cursor.className += " customCursorX";
        var body = document.body;
        var position;

        fast4(0,elems.length,function(i){
            elems[i].className += " customCursorXelem";
            elems[i].$evt('mouseenter',function(event){
                body.appendChild(cursor.$s('d:flex'));
                setPositon(event);
            });

            elems[i].$evt('mousemove',function(event){
                setPositon(event);
            });

            elems[i].$evt('mouseleave',function(event){
                cursor.$s('d:none');
            });
        });

        function setPositon(event){
            position = "translateX(" + event.clientX + "px) translateY(" + event.clientY + "px)";
            cursor.style.transform = position;
        }
    }
}

//text alerts
function alertUserX([data,parent],timeout){
    timeout ? null : timeout = 1000;
    let span = document.createElement('span');
    span.className = 'textAlertX';
    span.innerHTML = data;
    parent ? null : parent = document.body;
    parent.appendChild(span);
    setTimeout(function(){
        span.classList.add('fadeOut');
        setTimeout(function(){
            span.remove();
        },200)
    },timeout) 
}

//getScrollbarwidth
function getScrollbarWidth() {
  // Creating invisible container
  const parent = document.createElement('div');
  const child = document.createElement('div');
  parent.appendChild(child);

  parent.style.visibility = 'hidden';
  parent.style.overflow = 'scroll'; // forcing scrollbar to appear
  parent.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
  document.documentElement.appendChild(parent);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = (parent.offsetWidth - child.offsetWidth);

  // Removing temporary elements from the DOM
  parent.parentNode.removeChild(parent);

  return scrollbarWidth;
}

// get offsets relative to other elem
function relativeOffset(child,parent){
    let a = child.getBoundingClientRect();
    let b = parent.getBoundingClientRect();
    return {
        left: a.left - b.left,
        right: a.right - b.right,
        top: a.top - b.top,
        bottom: a.bottom - b.bottom
    }
}

// mutation observer
class Mutate{
    constructor([attr,child,tree],todo){
        var rThis = this;
        this.todo = todo ? todo : function(){console.log('mutation occured')};
        this.callback = function(mutationsList){
            for(var i=0; i<mutationsList.length; i++){
                if(rThis.todo(mutationsList[i])) break;
            }
        }
        this.mutaion = new MutationObserver(this.callback);
        this.config = {attributes:attr, childList:child, subtree:tree};
    }
    
    start(elem,todo){
        todo ? this.todo = todo : null;
        this.mutaion.observe(elem,this.config);
        console.log('observing mutations');
    }
    stop(){
        this.mutaion.disconnect();
        console.log('observer disconnected');
    }
}

// on instance avaliable
function checkInstance(tocheck,todo){
    setTimeout(function(){
        var temp = document.querySelector(tocheck);
        if(temp){
            todo(temp);
        }
        else checkInstance(tocheck,todo)
    },0)
}