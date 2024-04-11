$(document).ready(function(){
    if ($(window).width() < 767) {
        $('#chatscroll').slimScroll({
            //height: 'auto',
            height: (($(window).height()) - 110) + 'px',
            start: 'bottom',
            width: '100%',
            adisableFadeOut: 'true',
            allowPageScroll: 'true',
            scrollBy: '80px',
        });
    } else {
       $('#chatscroll').slimScroll({
            //height: 'auto',
            height: (($(window).height()) - 110) + 'px',
            start: 'bottom',
            width: '100%',
            adisableFadeOut: 'true',
            allowPageScroll: 'true',
            scrollBy: '80px',
        });
    }

    $('#chatscroll').slimscroll({ scrollBy: '80px' });
});
$(document).ready(function() {
    $('#chatscroll').slimscroll({ scrollBy: '80px' });
});
$(window).resize(function() {
    if($(window).width() < 767) {
        $('#chatscroll').slimScroll({
            //height: 'auto',
            height: (($(window).height()) - 110) + 'px',
            start: 'bottom',
            width: '100%',
            adisableFadeOut: 'true',
            allowPageScroll: 'true',
            scrollBy: '80px'
        });
    }else{
        $('#chatscroll').slimScroll({
            //height: 'auto',
            height: (($(window).height()) - 110) + 'px',
            start: 'bottom',
            width: '100%',
            adisableFadeOut: 'true',
            allowPageScroll: 'true',
            scrollBy: '80px'
        });
    }
    $('#chatscroll').slimscroll({ scrollBy: '80px' });
});


//START: Send chat message when enter key press
$('.chat_message_div').on("keypress", function(e) {
    if (e.keyCode == 13) {
        //console.log("keypress: ");
        chatMessageSave();
    }
});
//END: Send chat message when enter key press

//START: Send chat message when click on send button
$('.chat_msg_send').click(function(){
    chatMessageSave();   
});
//END: Send chat message when click on send button

function chatMessageSave(){
    
    if(userId != "" && userId != 0 && userId != null && userId != undefined){
        var message = $('.chat_message_div').text();
        if(message != ""){
            var ESC_MAP = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };            
            function escapeHTML(s, forAttribute) {
                return s.replace(forAttribute ? /[&<>'"]/g : /[&<>]/g, function(c) {
                    return ESC_MAP[c];
                });
            }
            var message = escapeHTML(message, true);
            var data = {'userId':userId, 'message':message};
            socket.emit('chatMessageSave', data, function(response){
                if(response.status == "success"){
                    $('.chat_message_div').text('');
                    //$.toast({heading: 'Success',text: response.message,position: 'top-right',icon: 'success',stack: false}); 
                }else{
                    $.toast({heading: 'Error',text: response.message,position: 'top-right',icon: 'error',stack: false}); 
                }
            });
        }else{
            $.toast({heading: 'Error',text: 'Please Enter Message.',position: 'top-right',icon: 'error',stack: false}); 
        }
    }else{
        $.toast({heading: 'Error',text: 'Please Login.',position: 'top-right',icon: 'error',stack: false});
    } 

    
}

//START: Socket call to getting chat messages
socket.emit('getMessages',async function(response){
    if(response.status == "success"){
        var chatHtml = ''; 
        for(var i=0; i<response.data.length; i++){
            var detail = response.data[i];
            chatHtml += await chatMessageHtml(detail);
        }

        $('.chat_message_list').html(chatHtml);
    }

     //$('#chatscroll').html(html);
    setTimeout(function(){

        var height = 10;
        $('.list-unstyled').find('li').each(function(){
            height += $(this).outerHeight();
        })
        $("#chatscroll").slimScroll({scrollTo:(parseInt(height))+'px'})
    }, 100)

});
//END: Socket call to getting chat messages


//START: Socket emit from server new user new message enter
socket.on('newChatMessage', async function(response){
    var chatHtml = await chatMessageHtml(response.data);
    $('.chat_message_list').append(chatHtml);
    $('#chatscroll').slimscroll({ scrollBy: '80px' });
});
//end: Socket emit from server new user new message enter

//START: Chat html create
function chatMessageHtml(detail){

    let name,profilePicc;
    if(detail.anymos == 1){
        name = 'Anonymous';
        profilePicc = 'anymos.jpg';
    }
    else{
        name = detail.userDetail.name;
        profilePicc = detail.userDetail.profile_image;
    }



    html = '<li class="left clearfix">';
    html += '<div class="chat-img pull-left">';
    html += '<img src="'+baseUrl+'frontend/upload/user/'+profilePicc+'"  alt="'+detail.userDetail.name+'">';
    html += '</div>';
    html += '<div class="chat-details">';
    html += '<div class="chat-user-name">';
    html += '<span class="cun-left" style="text-transform: capitalize;">'+name+'</span>';
    html += '<span class="cun-right">'+moment(detail.created_at).format('hh:mm a')+'</span>';
    html += '</div>';
    html += '<div class="chat-body clearfix">';
    html += '<div class="header_sec">'+detail.chat_message+'</div>';
    html += '</div>';
    html += '</div>';
    html += '</li>';

    return html;

    
}
//END: Chat html create

//START: Chat open and close
/*$('.chatbar-toggle-on').click(function(){
    $('.chat_open_btn').show();
});

$('.chat_open_btn').click(function(){
    $('.chatbar-toggle-on').show();
    $('.chat_open_btn').hide();
});*/
//END: Chat open and close
