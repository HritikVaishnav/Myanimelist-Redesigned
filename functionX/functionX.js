// Author : Hritik Vaishnav
// LinkedIn : https://in.linkedin.com/in/hritik-vaishnav

Node.prototype.$e = $e;
Node.prototype.$evt = $evt;

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
        document.onreadystatechange = function(){
            if(document.readyState === "complete"){
                callback();
            }
        }
    }
}