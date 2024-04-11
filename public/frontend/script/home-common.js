

$('[data-toggle="popover"]').popover({
    placement: 'top',
    trigger: 'click',
    html: true,
    content: function() {
        return $('#popover-content').html();
    }
});


// $('#body').addClass(localStorage.getItem("site_mode"));
// if(localStorage.getItem("site_mode") == "dark-mode"){
//     $('.mode input[type="checkbox"]').attr('checked', 'checked');
//     //$(".mode_class").text("Light Mode:");
//     $(".mode_class").text("Dark Mode:");
// }else{                
//     $(".mode_class").text("Light Mode:");
// }
document.onmousedown= disableclick;        
function disableclick(event){
    if(event.button==2)
    {             
        return false;    
    }
    
}
document.onkeydown = function(e) {
    if(event.keyCode == 123) {
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)){
        return false;
    }
    if(e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)){
        return false;
    }
}
let screenWidth = screen.width;
if(screenWidth <= 650){
    $('#body').removeClass('control-sidebar-open');
}
else{
    $('#body').addClass('control-sidebar-open');
}
//Start jackpot win game history
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
    winnersGameHistory();    
    //Hide Chat model on dashbord when user not loging.
    if(userId == 0){
        $('#body').removeClass('control-sidebar-open');
    }                  
    //end.
});    
socket.on('dashbordWinersGameData', function(response){                              
    if(response.status == "success"){                     
        //winnersGameHistory();                
        JackPortWinne(response.data.JackpotWinners);
        RecentWinner(response.data.RecentWinners);
        BigWinner(response.data.BigWinners);    
    }
});            
function winnersGameHistory(){
    socket.emit('homeJackpotWinners',function(response){                                          
        if(response.status == "success"){                                                                   
            JackPortWinne(response.data.JackpotWinners);
            RecentWinner(response.data.RecentWinners);
            BigWinner(response.data.BigWinners);
        }
    })
}            
function JackPortWinne(JackpotWinners){
    var winnersHtml = '';
    for(var i=0; i<JackpotWinners.length; i++){
        let detail = JackpotWinners[i];
        let userDetail = detail.userDetail;
        let name='';
        if(parseInt(userDetail.anymos) == 1){
            name = 'Anonymous';
        }else{
            name = userDetail.name;
        }                                              
        winnersHtml += '<li class="m-t-b-10 p-rel d-inline-block w-full">';
            winnersHtml += '<div class="winuser-img">';
                winnersHtml += '<img src="'+baseUrl+'frontend/upload/user/'+userDetail.profile_image+'" alt="user winner profile">';
            winnersHtml += '</div>';
            winnersHtml += '<div class="user-detail-right">';
                winnersHtml += '<p class="text_playout" style="text-transform: capitalize;"><b>'+name+' -</b> '+detail.game_name+'</p>';
                winnersHtml += '<p>'+detail.winning_amount+'</p>';
            winnersHtml += '</div>';
        winnersHtml += '</li>';
    }
    $('.homejackpotwinners').html(winnersHtml);  
}
function RecentWinner(RecentWinners){
    var winnersHtml = '';
    for(var i=0; i<RecentWinners.length; i++){
        let detail = RecentWinners[i];
        let userDetail = detail.userDetail;
        let name='';
        if(parseInt(userDetail.anymos) == 1){
            name = 'Anonymous';
        }else{
            name = userDetail.name;
        }                                              
        winnersHtml += '<li class="m-t-b-10 p-rel d-inline-block w-full">';
            winnersHtml += '<div class="winuser-img">';
                winnersHtml += '<img src="'+baseUrl+'frontend/upload/user/'+userDetail.profile_image+'" alt="user winner profile">';
            winnersHtml += '</div>';
            winnersHtml += '<div class="user-detail-right">';
                winnersHtml += '<p class="text_playout" style="text-transform: capitalize;"><b>'+name+' -</b> '+detail.game_name+'</p>';
                winnersHtml += '<p>'+detail.winning_amount+'</p>';
            winnersHtml += '</div>';
        winnersHtml += '</li>';
    }
    $('.recentWinners').html(winnersHtml);  
}
function BigWinner(BigWinners){
    var winnersHtml = '';
    for(var i=0; i<BigWinners.length; i++){
        let detail = BigWinners[i];
        let userDetail = detail.userDetail;
        let name='';
        if(parseInt(userDetail.anymos) == 1){
            name = 'Anonymous';
        }else{
            name = userDetail.name;
        }                                              
        winnersHtml += '<li class="m-t-b-10 p-rel d-inline-block w-full">';
            winnersHtml += '<div class="winuser-img">';
                winnersHtml += '<img src="'+baseUrl+'frontend/upload/user/'+userDetail.profile_image+'" alt="user winner profile">';
            winnersHtml += '</div>';
            winnersHtml += '<div class="user-detail-right">';
                winnersHtml += '<p class="text_playout" style="text-transform: capitalize;"><b>'+name+' -</b> '+detail.game_name+'</p>';
                winnersHtml += '<p>'+detail.winning_amount+'</p>'
            winnersHtml += '</div>';
        winnersHtml += '</li>';
    }
    $('.bigWinners').html(winnersHtml);  
}

setInterval(function() {
    // var contrecent = document.getElementById('recentWinners');
    // contrecent.appendChild(contrecent.firstChild);
    // var contbig = document.getElementById('bigWinners');
    // contbig.appendChild(contbig.firstChild);
    // var contjack = document.getElementById('homejackpotwinners');
    // contjack.appendChild(contjack.firstChild);
}, 2000);
$(".silderBtn").on('click',function(){              
    $(".navbar-collapse").collapse("hide");    
}); 
$(".collapse_slider").on('click',function(){    
    
    $('#body').removeClass('sidebar-open');
    $(".navbar-collapse").collapse("show");           
});

$(".navbar-toggle").click(function(){
$("body").removeClass("sidebar-open");
});
$(".mobile-chat-icon").click(function(){
$("body").removeClass("sidebar-open");
});

$(document.body).click( function() {
    $('.collapse').collapse('hide');
});

