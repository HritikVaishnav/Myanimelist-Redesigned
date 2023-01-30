// initializing visible editors
function do_when_wyibb_avaliable(){
    if($.wysibb){
        let textarea = document.getElementsByClassName('textarea');
        for(let i=0; i<textarea.length; i++){
            if(textarea[i].offsetHeight > 0){
                makeBBeditor($(textarea[i]),textarea[i].value);
                let temp = textarea[i].closest('#dialog');
                temp ? temp.classList.add('editor_container') : null;
            }
        }
        let other = document.getElementById('add_anime_comments');
        if(other) makeBBeditor($(other));
    } else {
        setTimeout(function(){
            do_when_wyibb_avaliable()
        },200)
    }
}
do_when_wyibb_avaliable();

// identifying quick-reply container
let quickreply_container = $('#quickReply');
quickreply_container[0] ? quickreply_container.parent().addClass('quickreply_container') : null;

// initializing event
let reply_textarea;
document.addEventListener('click',function(e){
    if(e.target.tagName === 'A'){
        let identity = `${e.target.className} ${e.target.id}`;

        if(identity.search(/js-forum-quote-button|showQuickReply/) > -1){
            if(!reply_textarea){
                reply_textarea = $('#messageText');
                makeBBeditor(reply_textarea);
            };
            focusLater(reply_textarea);
        }
        else if(identity.search('quickEdit') > -1) {
            if(!(e.target.editorInit)){
                let temp = e.target.closest('.postActions');
                if(temp){
                    let editor = e.target.editor = temp.parentElement.getElementsByTagName('textarea')[0];
                    if(editor.id.startsWith('messageEdit')){
                        if(!(editor.$modeSwitch)){
                            makeBBeditor($(editor));
                            e.target.editorInit = true;
                        }
                    }
                }
            };
            focusLater(e.target.editor,1000);
        }
    }
    if(e.target.tagName === 'SPAN'){
        let tabs = e.target.closest('.malr_tabs_container');
        if(tabs && !(tabs.editorInit)){
            let commentBox = tabs.getElementsByClassName('textarea')[0];
            commentBox ? makeBBeditor($(commentBox)) : null;
            tabs.editorInit = true;
        }
    }
})

// function to initialize Editor
function makeBBeditor(textarea, initial_Input){
    if(textarea){
        textarea.wysibb({bbmode:true});
        let wysibb = textarea.data('wbb');
        if(initial_Input) wysibb.$txtArea.bbcode(initial_Input);
        textarea[0].parentElement.addEventListener('input',function(e){
            if(e.data === ' '){
                let usertag = wysibb.isContain(wysibb.getSelectNode(),wysibb.options.allButtons['usertag'].rootSelector[0]);
                usertag ? wysibb.wbbRemoveCallback('usertag') : null;
            }
        });
        let actions = textarea.closest('.wysibb').next().children('input');
        if(actions[0]){
            actions[actions.length-1].addEventListener('click',function(){
                textarea.htmlcode('');
            })
        }
    }
}
function focusLater(editor,time=500){
    setTimeout(function(){
        editor.focus();
    },time)
}