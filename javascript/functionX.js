// Author : Hritik Vaishnav
// LinkedIn : https://in.linkedin.com/in/hritik-vaishnav

Node.prototype.$e = $e;
Node.prototype.$E = $E;
Node.prototype.$multiselect = $multiselect;
Node.prototype.$evt = $evt;
Node.prototype.$cs = $cs;
Node.prototype.$addChildren = $addChildren;
Node.prototype.$closest = $closest;
HTMLCollection.prototype.$loop = $loop;
NodeList.prototype.$loop = $loop;

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
function $e(elem){
    var parent = this.nodeType === 1 ? this : document;
    if(elem[0] === '@'){
        var temp = elem.substr(1)
        return parent.querySelectorAll(temp);
    }
    else{
        return parent.querySelector(elem);
    }
}
function $E(elem){
    let parent = this.nodeType === 1 ? this : document;
    let e;
    if(elem[0] === '#')
        e = parent.getElementById(elem.substr(1))
    else if(elem[0] === '@')
        elem[1] === '.' ?
            e = parent.getElementsByClassName(elem.substr(2))
            : e = parent.getElementsByTagName(elem.substr(1))
    else
        elem[0] === '.' ?
            e = parent.getElementsByClassName(elem.substr(1))[0]
            : e = parent.getElementsByTagName(elem)[0]  
            
    return e        
}
function $multiselect(elems,combineCollections){
    let temp = elems.split(',');
    let list = [];
    for(let i=0; i<temp.length; i++){
        let temp2 = this.$E(temp[i]);
        if(temp2){
            if(temp2.length === undefined)
                list.push(temp2)
            else
                temp2[0] ? 
                    combineCollections ? 
                        list = list.concat(Array.from(temp2))
                        : list.push(temp2) 
                    : null; 
        }
    }
    return list;
}
function selectTill(start,end,includeEndPoints){
    let temp = [];
    let helper = start;
    includeEndPoints ? temp.push(start) : null;
    while(!temp.complete){
        helper = helper.nextSibling;
        if(helper === null) temp.complete = true;
        else {
            if(checkWithEnd(helper)) {
                includeEndPoints ? temp.push(helper) : null
                temp.complete = true;
            }
            else temp.push(helper)
        }
    }
    return temp;
    function checkWithEnd(elem){
        let temp = false;
        elem.tagName === end.tag.toUpperCase() ? temp = true : temp = false;
        if(elem.nodeType === 1){
            end.class ? (checkcls(elem) ? temp = true : temp = false) : null;
            end.id ? (elem.id === end.id ? temp = true : temp = false) : null;
            end.attribute ? (elem.getAttribute(end.attribute[0]) === end.attribute[1] ? temp = true : temp = false):null;
        }
        return temp;
    }
    function checkcls(elem){
        let ls = elem.classList;
        if(end.class.constructor.name !== 'Array')
            return ls.contains(end.class)
        else
            return end.class.some(function(cls){return ls.contains(cls)})    
    }
}
function $addChildren(list){
    let parent = this;
    fast4(0,list.length,function(i){
        if(list[i]){
            if(list[i].constructor.name !== 'Array'){
                list[i] ? parent.appendChild(list[i]):null
            }
            else{
                parent.$addChildren(list[i]);
            }
        }
    })
}
function cloneAndReplace(elem){
    if(elem.constructor.name === 'Array'){
        let clones = [];
        fast4(0, elem.length, function(i){
            clones.push(temp(elem[i]))
        })
        return clones;
    } 
    else return temp(elem);

    function temp(item){
        let clone = item.cloneNode(true);
        item.parentNode.replaceChild(clone, item);
        return clone;
    }
}
function $closest(tofind,nest_level){
    let nest_counter = 0; let origin = this; let inputs=[];
    inputs.array = tofind.split('|');
    inputs.array.forEach(function (item) {
        let temp = {};
        temp.cls = item.split('.');
        item[0] === '.' ? temp.cls.shift() : (temp.tag = temp.cls[0], temp.cls.shift());
        inputs.push(temp);
    })
    return find(origin);
    
    function find(origin){
        let temp;
        if(nest_counter){
            temp = checkElem(origin);
            if(!temp){
                temp = checkAdjacent(origin)
                if(temp) return temp
            }
            else return temp
        }
        else{
            temp = checkAdjacent(origin);
            if(temp) return temp
        }
        
        temp = origin.parentElement;
        if(temp && nest_counter < nest_level) {nest_counter++; return find(temp)}
        else return null;
    }
    function checkAdjacent(origin){
        let e = check(origin) || check(origin,true);
        return e;
        
        function check(origin,searchDown){
            let sibling = searchDown ? origin.nextElementSibling : origin.previousElementSibling;
            if(sibling){
                if(checkElem(sibling)) return sibling
                else {
                    let temp = sibling.querySelectorAll(inputs.array);
                    if(temp[0]) {
                        if(searchDown) return temp[0]
                        else return temp[temp.length-1]
                    }
                    else return check(sibling,searchDown)
                }
            } else {
                return false
            }
        }
    }
    function checkElem(elem){
        let tagName = elem.tagName.toLowerCase();
        let clsList = elem.classList;
        let output = inputs.some(function (input) {
            if(input.tag) { if(tagName !== input.tag) return false }
            if(input.cls) return checkCls(input.cls)
            else return true
        });
        function checkCls(clsArray){
            if(clsList.length >= clsArray.length){
                for(let i=0; i<clsArray.length; i++){
                    if(!(clsList.contains(clsArray[i]))) return false;
                }
                return true
            } else {
                return false
            }
        }

        if(output) return elem 
        else return false
    }
}
function wrap(to_wrap,wrap_in){
    if(to_wrap && to_wrap[0]){
        let temp = wrap_in ? wrap_in.split(/[.#]/) : [];
        let wrapper = wrap_in ? document.createElement(temp[0]) : document.createElement('div');
        temp[1] ? wrap_in.indexOf('#') > 0 ? wrapper.id = temp[1] : wrapper.className = temp[1] : null;
        fast4(0, to_wrap.length, function(i){
            to_wrap[i] ? wrapper.appendChild(to_wrap[i]) : null
        });
        return wrapper;
    } else {
        return null;
    }
}
function directTxt(elem){
    return Array.prototype.reduce.call(elem.childNodes, function(a,b){
            return a + (b.nodeType === 3 ? b.textContent : '')
    },'')
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

//string dom maker
function newBlock(data,objs){
    var callbackCode = [], dom = null, tree, obj_tree = objs || {};
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
    dom.objs = obj_tree;
    return dom;
    function createBlock(block){
        var temp = block.split('+');
        var elements = [];
        for(var i=0; i<temp.length; i++){
            if(temp[i] === 'callback'){
                var str = callbackCode.pop();
                var code = str.substring(1,str.length-1);
                var output = newBlock(code,obj_tree);
                output.length > 1 ? null:output = output[0];
                elements.push(output);
            }
            else{
                var element = create(temp[i],i);
                elements.push(element);
            }
        }
        return elements;
    }
    function create(elem,i){
        var temp = elem.replace(/[#/]/g,' ').replace('.',' ').split(" ");
        var tag = temp[0];
        var txt = elem.search('/') > -1 ? temp[temp.length-1].replace(/[_]/g,' '):null;
        var id = elem.search('#') > -1 ? temp[1] :null;
        var classs = elem.search('[.]') > -1 ? (id ? temp[2] : temp[1]).replace(/[.]/g,' '):null;
        var e  = newElement({e:tag,cls:classs,id:id,txt:txt});
        id ? obj_tree[id]=e : classs ? obj_tree[classs]=e : obj_tree[tag+i]=e;
        return e;
    }
}

//getting computed style
function $cs(props,num){
    var output=[];
    var e = this;
    props = props.split(',');
    fast4(0,props.length,function(i){
        var value = window.getComputedStyle(e,null).getPropertyValue(props[i]);
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
    
    restore(fn){
        this.elem.addEventListener(this.type,this.callbacks[fn],this.captureFlags[fn])
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

//ScrollToTop
class scrollToTopX{
    constructor(){
        this.e = newBlock("span#scrollTopX>{span.top>i.iconx-up}+{span.bottom>i.iconx-down}");
        this.flag = false;
        this.setListner();
    }

    setListner(){
        var rThis = this;
        document.body.appendChild(rThis.e[0]);
        rThis.e.objs.top.$evt('click',function(event){
            window.scroll({top:0,behavior:'smooth'});
        },'scrollTopBtn');
        rThis.e.objs.bottom.$evt('click',function(event){
            window.scroll({top:document.body.scrollHeight,behavior:'smooth'});
        },'scrollBottomBtn');
        $evt('scroll',function(event){
            if(window.scrollY > 150){
                if(rThis.flag){}
                else{ rThis.e[0].classList.add('active'); rThis.flag = true }
            }
            else{
                if(rThis.flag){ rThis.e[0].className='scrollTopX'; rThis.flag = false }
                else{}
            }
        },'scrollToTopX');
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

// Dom load function
function onDomLoad(callback){
    if(document.readyState !== "loading") callback()
    else window.addEventListener('DOMContentLoaded',callback)
}

// Dom ready function
function onDocumentReady(callback){
    if(document.readyState === "complete") callback()
    else{
        document.addEventListener('readystatechange',function(){
            if(document.readyState === 'complete'){
                callback();
            }
        })
    }
}

// node looping
function $loop(callback){
    for(let i=0; i<this.length; i++){
        callback(i);
    }
}

// slide block
function slideBlock(list,list_parent,pxToMove){
    list.childElementCount ? null : list_parent.classList.add('no-child');
    // appending buttons
    let buttons = newBlock('div.actions > span.left + span.right + span.layout');
    list_parent.appendChild(buttons[0]);

    list_parent.classList.add('slide-block-x');
    list.classList.add('slide-list-x');

    buttons.objs.left.addEventListener('click',slide);
    buttons.objs.right.addEventListener('click',slide);
    buttons.objs.layout.addEventListener('click',changeLayout);

    function changeLayout(){
        this.classList.toggle('inline');
        list.style.transform = "";
        list.classList.toggle('grid');
    }

    function slide(){
        let btn = this;
        let max_x_value = -(list.scrollWidth - list.offsetWidth);
        pxToMove ? null : pxToMove = list.offsetWidth / 2;
        let tr_x = list.$cs('transform').match(/matrix.*\((.+)\)/)[1].split(', ');
        
        if(btn.classList.contains('left')){
            tr_x[4] = Math.min(0, Math.max(max_x_value, (tr_x[4] - (-pxToMove))));
        } else{
            tr_x[4] = Math.min(0, Math.max(max_x_value, (tr_x[4] - pxToMove)));
        }
        list.style.transform = "matrix(" + tr_x.join() + ")";

        if(tr_x[4] === 0 || tr_x[4] <= max_x_value){
            btn.classList.add('slide_end');
            setTimeout(function(){
                btn.classList.remove('slide_end');
            },300)
        }
    }
}

// intersection observer
function iObserver(callback,options,name){
    if(!window[name]) {
        console.log('creating iobserver');
        window[name] = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
                callback(entry)
            })
        },options)
    }
    return window[name];
}

// xhttp request
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function softLoad(flags,position){
    if(isNaN(flags.tstyle_init)){
        document.documentElement.classList.add('softLoadContent');
        flags.tstyle = document.createElement('style');
        flags.tstyle.appendChild(document.createTextNode('#contentWrapper{display:none !important}'));
        position.insertAdjacentElement('afterend',flags.tstyle);
        flags.tstyle_init = true;
        onDocumentReady(function(){
            if(flags.tstyle_init) softLoad(flags)
        });
    } else {
        flags.tstyle_init = false;
        flags.tstyle.remove();
    }
}

// doc fragment
function newFrag(children){
    let frag = new DocumentFragment();
    for(let i=0; i<children.length; i++){
        frag.appendChild(children[i])
    }
    return frag
}

// estension related
function set(toset) {
    chrome.storage.local.set(toset);    
}
function get(toget,callback) {
    chrome.storage.local.get(toget,function(res){
      callback(res);
    });
}
function curl(path){
    return chrome.runtime.getURL(path)
}