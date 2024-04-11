// $('.tbl_timer h3').text("");
var stopNumber = '';
function blinkText(number) {
  stopNumber = '.blink' + number;
  var bgcolor = '';
  var fontcolor = '';
  if (number == '0') {
    bgcolor = "#34c106";
    fontcolo = "#ffff00";
  } else {
    var redno = numred.includes(number);
    if (redno == true) {
      bgcolor = "#f10404";
      fontcolo = "#fffff";
    } else {
      bgcolor = "#000000"
      fontcolor = "#fff";
    }
  }
  $('.blink' + number).each(function () {
    var elem = $(this);
    $(this).css({ 'font-size': '16px', 'color': fontcolor, 'background-color': bgcolor });
    var ccunt = 0;
    for (let ii = 0; ii < 5; ii++) {
      ccunt += ii;
      elem.fadeOut(100)
        .fadeIn(100)
        .fadeOut(100).fadeIn(100);
    }
  });
}


$(document).ready(function () {
  localStorage.setItem("getBetHistory", JSON.stringify([]));
  if (!userId) {
    $('#welcomeModal').modal('show');
    setTimeout(function () {
      $('#welcomeModal').modal('hide');
    }, 30000);
  }
});
$(".welcome-btn").click(function () {
  $('#welcomeModal').modal('hide');
  $(".login-register-modal").modal("show");
});
// $(window).resize(function () {
//   gototop();
// });
// function gototop() {
//   if ($(window).width() < 992) {
//     if ($(".spin_roulet").hasClass("page-top") == false) {
//       $(".spin_roulet").addClass("page-top");
//     }
//   } else {
//     $(".spin_roulet").removeClass("page-top")
//   }
// }

// function gotoWheeltop() {
//   if ($(window).width() < 992) {
//     if ($(".spin_roulet").hasClass("page-top") == false) {
//       $(".spin_roulet").addClass("page-top");
//     }
//     $('.page-top').click(function () {
//       $("html, body").animate({
//         scrollTop: 0
//       }, 600);
//       return false;
//     });
//   }
// }

$(".spinbtn").click(function () {
  clearInterval(timerInterval);
  $(".spinbtnlist").addClass("blockdiv");

  clearTimeout(setPopupTimeOut);
  setPopupTimeOut = setTimeout(function () {
    $(".spinbtnlist").removeClass("spin-open");
  }, 3000);
  clearTimeout(setScollerTimer);
  setScollerTimer = setTimeout(function () {
    $("html, body").animate({
      scrollTop: 0
    }, 600);
  }, 3000);
  playerPlaceBet(false, $(".spinbtnlist"));
});

$(".tarbobtn").click(function () {
  clearInterval(timerInterval);
  $(".spinbtnlist").addClass("blockdiv");

  clearTimeout(setPopupTimeOut);
  setPopupTimeOut = setTimeout(function () {
    $(".spinbtnlist").removeClass("spin-open");
  }, 3000);
  clearTimeout(setScollerTimer);
  setScollerTimer = setTimeout(function () {
    $("html, body").animate({
      scrollTop: 0
    }, 600);
  }, 3000);
  playerPlaceBet(true, $(".spinbtnlist"));
});

function playerPlaceBet(isTurbo, e) {
  let selectBetCoin = $('input[name="bet_amount"]:checked').val();
  if (userId != 0 && userId != "" && userId != null) {
    if (selectBetCoin != null && selectBetCoin != "") {
      if (placeBetObj.playerSelectBet.length > 0) {
        localStorage.setItem("betsDetail", JSON.stringify(placeBetObj));
        socket.emit('placeBet',{ "playerId": userId, 'xyz': 'pqx', isTurbo: isTurbo, "currenttime": nounce, "walletId": $('.user_main_balance').attr("data-myval"), "placeBetObj": placeBetObj }, function (res) {
          if (res.status == "success") {
            // console.log("resss", res);            
            // gotoWheeltop();            
            $(".place_bet_light_roulette").addClass("active");
            $(".reBets").addClass("hidediv");
            $(".2xBets").addClass("hidediv");
            $(".lobby").addClass("blockdiv");
            $(".coin-btn").addClass("blockdiv");
            $('#alert').css({ "display": "none" });
            $(".rullateLobby").attr("style", "pointer-events: none;");
            disableBet();
            $('.user_main_balance').text(parseFloat(res.data.walletDetail.main_balance).toFixed(8));
            $(".coin" + res.data.walletDetail.wallet_id).text(parseFloat(res.data.walletDetail.main_balance).toFixed(8));
            $.toast({ heading: 'Success', text: res.message, position: 'top-right', icon: 'success', stack: false });

            // spinRoullete(userId);
          } else if (res.status == "alert") {
            $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false });
            setTimeout(() => {
              window.location = baseUrl + "provably-fair/sheed"
            }, 1500);
          } else if (res.status == "info") {
            clearTimeout(setScollerTimer);
            $(".noBets").text(parseFloat(0).toFixed(2));
            localStorage.removeItem("playerPlaceBetObj");
            resetGameLobby();
            e.removeClass("blockdiv");
            $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'info', stack: false, hideAfter: 4000 });
            startTimer();
          } else {
            clearTimeout(setScollerTimer);
            e.removeClass("blockdiv");
            $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false });
            startTimer();
          }
        });
      } else {
        clearTimeout(setScollerTimer);
        startTimer();
        e.removeClass("blockdiv");
        $.toast({ heading: '', text: "Please select number.", position: 'top-right', icon: 'error', stack: false });
        return false;
      }
    } else {
      clearTimeout(setScollerTimer);
      startTimer();
      e.removeClass("blockdiv");
      $.toast({ heading: '', text: "Please select coin.", position: 'top-right', icon: 'error', stack: false });
    }
  } else {
    clearTimeout(setScollerTimer);
    startTimer();
    e.removeClass("blockdiv");
    $.toast({ heading: '', text: "Please login.", position: 'top-right', icon: 'error', stack: false });
  }
}

$('.place_bet_light_roulette').on('click', function () {
  return false;
});

function sameBetSpin(isTurbo, placeBetObj) {
  // console.log('sameBetSpin...........');
  // console.log('isTurbo-- >', isTurbo);
  // console.log('placeBetObj -->', placeBetObj);

  $(".samebetlistshow").addClass("blockdiv");
  if (placeBetObj.playerSelectBet.length > 0) {
    localStorage.setItem("betsDetail", JSON.stringify(placeBetObj));
    socket.emit('placeBet', { "playerId": userId, isTurbo: isTurbo, "currenttime": nounce, "walletId": $('.user_main_balance').attr("data-myval"), "placeBetObj": placeBetObj }, function (res) {
      if (res.status == "success") {
        // console.log("resss", res);
        // gotoWheeltop();
        $(".samebetlistshow").addClass("blockdiv");
        $(".spinbtnlist").addClass("blockdiv");
        $(".place_getStopNumberEventbet_light_roulette").addClass("active");
        $(".lobby").addClass("blockdiv");
        $(".coin-btn").addClass("blockdiv");
        $('#alert').css({ "display": "none" });
        $(".rullateLobby").attr("style", "pointer-events: none;");
        disableBet();
        $('.place_bet_light_roulette').attr('disabled');
        $('.user_main_balance').text(parseFloat(res.data.walletDetail.main_balance).toFixed(8));
        $(".coin" + res.data.walletDetail.wallet_id).text(parseFloat(res.data.walletDetail.main_balance).toFixed(8));
        $.toast({ heading: 'Success', text: res.message, position: 'top-right', icon: 'success', stack: false });

        // setTimeout(function () {
        //   $(".samebetlistshow").addClass("hidediv");
        // }, 3000);
        // spinRoullete(userId);
      } else if (res.status == "alert") {
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false });
        setTimeout(() => {
          window.location = baseUrl + "provably-fair/sheed"
        }, 1500);
        
        // $(".samebetlgetStopNumberEventistshow").removeClass("blockdiv");
        $(".samebetlistshow").removeClass("blockdiv");

      } else if (res.status == "info") {
        clearTimeout(setScollerTimer);
        $(".noBets").text(parseFloat(0).toFixed(2));
        resetBoard();
        localStorage.removeItem("playerPlaceBetObj");
        $(".place_bet_light_roulette").attr('disabled', false);
        $(".samebetlistshow").removeClass("blockdiv");
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'info', stack: false, hideAfter: 4000 });
      } else {
        clearTimeout(setScollerTimer);
        $(".samebetlistshow").removeClass("blockdiv");
        $(".place_bet_light_roulette").attr('disabled', false);
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false });
      }
    });
  } else {
    clearTimeout(setScollerTimer);
    $(".samebetlistshow").removeClass("blockdiv");
    $(".place_bet_light_roulette").attr('disabled', false);
    $.toast({ heading: '', text: "Please select number.", position: 'top-right', icon: 'error', stack: false });
    return false;
  }
}

socket.on("getStopNumberEvent", (res) => {
  showWinBetDiv("show");  
  if (res.status == "success") {
    disableBet();
    spinTo(res.data.stopped_on_number, res.data.rouletSpinTimer);
  } else {
    rendomspin();
    $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false });
  }
});

socket.on("gamecompleteEvent", function (res) {
  if (res.status == "success") {
    blinkText(res.data.game.stopped_on_number);
    if (res.data.playerId == userId) {
      if (!res.data.isWin) {
        $(".lastWin").text(0);
        $.toast({ heading: '', text: 'You do not receive money', position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
      } else {
        if (res.data.totalNetWin == Math.floor(res.data.totalNetWin)) {
          $(".lastWin").text(parseInt(res.data.totalNetWin));
        } else {
          $(".lastWin").text(parseFloat(res.data.totalNetWin).toFixed(2));
        }
        updateWallete(res.data.walleteDetail);
        $.toast({ heading: '', text: 'You receive money', position: 'top-right', icon: 'success', stack: false, hideAfter: 2000 });
        if (parseFloat(parseFloat(res.data.netTotalGain).toFixed(2)) > 0) {
          $(".firework").show();
        }
      }
    }

    updateHistory(res.data.game.stopped_on_number);
    // historyDataArray(res.data.game.stopped_on_number);
    resetGameLobby();
    setTimeout(() => {
      $(".blink" + res.data.game.stopped_on_number).removeAttr("style")
    }, 4000);
  } else {
    resetGameLobby();
  }
});

socket.on("newgame", (res) => {
  if (res.status == "success") {
    gamelobyUpdate(res.data.game);
  } else {
    $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false });
  }
});

//START: Player winner and lose popup show and hide
function winnerLoseLogic(winnerStatus, text) {
  if (winnerStatus == "lose" || winnerStatus == "no") {
    $('#alert').removeClass('alert-info alert-success alert-error alert-dismissible');
    $('#alert').addClass('alert-danger');
    $('#alert span').text("You lose!");
    $('#alert').fadeIn();
  }

  if (winnerStatus == "win" || winnerStatus == "yes") {
    $('#alert').removeClass('alert-info alert-success alert-error alert-dismissible');
    $('#alert').removeClass('alert-danger');
    $('#alert').addClass('alert-success');
    $('#alert span').text('You won!');
    $('#alert').fadeIn();
  }
}
//END: Player winner and lose popup show and hide

function updateHistory(no) {
  $(".lastStop").text(no); // x
  let color = '';
  var clr = ''
  if (numblack.includes(parseInt(no)) == true) {
    color = 'badge-gray';
    clr = 'black'
  } else if (numred.includes(parseInt(no)) == true) {
    color = 'badge-danger';
    clr = 'red'
  } else {
    color = '';
  }
  
  $(".lastStop").text(no).css("color", clr);
  betStopNumberHistory()

  if ($('.rouletteHistory li').length >= 25) {
    $('.rouletteHistory li:last-child').remove();
  }
  $('.rouletteHistory').prepend(`<li class="badge ` + color + `">` + no + `</li>`);
}
// start :  historyDataArray
// function historyDataArray(no) {
//   console.log('no -->', no);

//   if(numblack.includes(parseInt(no))){
//     $('tr.red-black ').append('<td></td><td>yes</td>');
//   }else{
//     $('tr.red-black').append('<td>yes</td><td></td>');
//   }
// }
// end :  historyDataArray


function lastGameHistory() {
  $(".rouletteHistory").empty();
  var hhtml = "";
  socket.emit("previousStopNum", { "playerId": userId }, (res) => {
    // console.log("res.data.history.length", res.data.history.length);
    if (res.status == "success") {
      for (var h = 0; h < res.data.history.length; h++) {
        let color = '';
        if (numblack.includes(parseInt(res.data.history[h].stopped_on_number)) == true) {
          color = 'badge-gray';
        } else if (numred.includes(parseInt(res.data.history[h].stopped_on_number)) == true) {
          color = 'badge-danger';
        } else if (res.data.history[h].stopped_on_number == "0") {
          color = '';
        }

        hhtml += `<li class="badge ` + color + `">` + res.data.history[h].stopped_on_number + `</li>`;
      }
      $(".rouletteHistory").html(hhtml);
    } else {
      $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
    }
  });
}
socket.on("getEmailNotification", (res) => {
  console.log(res);
  if (res.status == true || res.status == "true") {
    setTimeout(() => {
      $.toast({ heading: '', text: "Verification of the fairness email send on you registered email.", position: 'top-right', icon: 'success', stack: true, hideAfter: 2000 });
    }, 2000)
  } else {
    setTimeout(() => {
      $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: true, hideAfter: 2000 });
    }, 2000);
  }
});

socket.on("currentGame", (res) => {
  // console.log("currentGame", res);
  gamelobyUpdate(res);
});
function gamelobyUpdate(g) {
  $(".roundNo").text(g.game_number);
  $(".gameHash").text(g.game_hash);
  $(".noBets").text(parseFloat(g.bet_amount).toFixed(2));
  $("#gameno").val(g.id);
  window.rid = g.id;
}

function updateWallete(w) {
  if ($(".user_main_balance").data("myval") == w.id) {
    $('.user_main_balance').text(parseFloat(w.main_balance).toFixed(8));
  }
  $(".coin" + w.id).text(parseFloat(w.main_balance).toFixed(8));
}

function resetGameLobby() {
  resetBoard();
  $('.place_bet_light_roulette').attr('disabled', false);
  $('.place_bet_light_roulette').removeAttr('disabled');
  // $('.place_bet_light_roulette').html('Place Your Bet');
  $(".spinbtnlist").removeClass("blockdiv");
  $(".lobby").removeClass("blockdiv");
  $(".coin-btn").removeClass("blockdiv");
  $(".place_bet_light_roulette").removeClass("active");
  $(".samebetlistshow").removeClass("hidediv");
  $(".samebetlistshow").removeClass("blockdiv");
  $(".spinbtnlist").removeClass("blockdiv");
  if (!localStorage.getItem("betsDetail") || localStorage.getItem("betsDetail") == null) {
    $(".reBets").addClass("hidediv");
    $(".reBets").attr('disabled', true);
    $(".2xBets").addClass("hidediv");
    $(".2xBets").attr('disabled', true);
  } else {
    $(".reBets").attr('disabled', false);
    $(".reBets").removeClass("hidediv");
    $(".2xBets").attr('disabled', false);
    $(".2xBets").removeClass("hidediv");
  }
  setTimeout(function () {
    $(".firework").hide();
  }, 5000);
  startTimer();
}

var idleTime = 0;
$(document).ready(function () {
  // Increment the idle time counter every minute.
  var idleInterval = setInterval(timerIncrement, 60000); // 1 minute

  // Zero the idle timer on mouse movement.
  $(this).mousemove(function (e) {
    idleTime = 0;
  });
  $(this).keypress(function (e) {
    idleTime = 0;
  });
});

function timerIncrement() {
  idleTime = idleTime + 1;
  // console.log("idleTime", idleTime);
  if (idleTime > 2) { // 20 minutes
    window.location.reload();
  }
}


function SaveDataToLocalStorage(data, key) {
  var a = [];
  // Parse the serialized data back into an aray of objects
  if (!JSON.parse(localStorage.getItem(key))) {
    a.push(data);
    localStorage.setItem(key, JSON.stringify(a));
  } else {
    a = JSON.parse(localStorage.getItem(key));
    a.push(data);
    localStorage.setItem(key, JSON.stringify(a));
  }
}