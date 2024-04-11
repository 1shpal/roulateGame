var rotationsTime = 20;
var wheelSpinTime = 18;
var ballSpinTime = 15;
window.rid = "";
var numorder = [32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
var numred = [32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3];
var numblack = [15, 4, 2, 17, 6, 13, 11, 8, 10, 24, 33, 20, 31, 22, 29, 28, 35, 26];
var numgreen = [0];
var first1to18 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
var left = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
var right = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
var firstTwelve = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
var secondTwelve = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
var numbg = $(".pieContainer");
var ballbg = $(".ball");

var btnSpin = $("#btnSpin");
var toppart = $("#toppart");
var pfx = $.keyframe.getVendorPrefix();
var transform = pfx + "transform";
var rinner = $("#rcircle");
var numberLoc = [];
$.keyframe.debug = true;
var triggerBetValue = [];

// Player Bet
var placeBetObj = {
    totalBetAmount: 0,
    totalChipsBetAmount: 0,
    playerSelectBet: [],
    playerSelectBetHistory: []
};

$(window).load(function () {
    rendomspin()
})

createWheel();
function createWheel() {
    var temparc = 360 / numorder.length;
    for (var i = 0; i < numorder.length; i++) {
        numberLoc[numorder[i]] = [];
        numberLoc[numorder[i]][0] = i * temparc;
        numberLoc[numorder[i]][1] = i * temparc + temparc;
        newSlice = document.createElement("div");
        $(newSlice).addClass("hold");
        newHold = document.createElement("div");
        $(newHold).addClass("pie");
        newNumber = document.createElement("div");
        $(newNumber).addClass("num");

        newNumber.innerHTML = numorder[i];
        $(newSlice).attr("id", "rSlice" + i);
        $(newSlice).css(
            "transform",
            "rotate(" + numberLoc[numorder[i]][0] + "deg)"
        );

        $(newHold).css("transform", "rotate(9.73deg)");
        $(newHold).css("-webkit-transform", "rotate(9.73deg)");

        if ($.inArray(numorder[i], numgreen) > -1) {
            $(newHold).addClass("greenbg");
        } else if ($.inArray(numorder[i], numred) > -1) {
            $(newHold).addClass("redbg");
        } else if ($.inArray(numorder[i], numblack) > -1) {
            $(newHold).addClass("greybg");
        }

        $(newNumber).appendTo(newSlice);
        $(newHold).appendTo(newSlice);
        $(newSlice).appendTo(rinner);
    }
    //console.log(numberLoc);
}

function changeHeight() {
    $('.boostKeyframe').animate({ height: 200 }, 500);
}
$("#btnb").click(function () {
    $(".spinner").css("font-size", "+=.3em");
});
$("#btns").click(function () {
    $(".spinner").css("font-size", "-=.3em");
});

function resetAni() {
    animationPlayState = "animation-play-state";
    playStateRunning = "running";

    $(ballbg)
        .css(pfx + animationPlayState, playStateRunning)
        .css(pfx + "animation", "none");

    $(numbg)
        .css(pfx + animationPlayState, playStateRunning)
        .css(pfx + "animation", "none");
    $(toppart)
        .css(pfx + animationPlayState, playStateRunning)
        .css(pfx + "animation", "none");

    $("#rotate2").html("");
    $("#rotate").html("");
}

function spinTo(num, jawheelTime = 15000) {
    //get location
    var temp = numberLoc[num][0] + 4;
    //randomize
    var rndSpace = Math.floor(Math.random() * 360 + 1);

    resetAni();
    setTimeout(function () {
        bgrotateTo(rndSpace, parseInt(jawheelTime / 1000));
        ballrotateTo(rndSpace + temp, parseInt(jawheelTime / 1000));
    }, 500);
}

//create me
function rendomspin() {
    setTimeout(function () {
        var rndSpace = Math.floor(Math.random() * 360 + 1);
        randombgrotateTo(rndSpace, 1000);
        randomballrotateTo(rndSpace, 10000);
    }, 1000);
}

function ballrotateTo(deg, jawheelTime) {
    var temptime = jawheelTime + 's';
    var dest = -360 * ballSpinTime - (360 - deg);
    if ($(window).innerWidth() <= 767) {
        $.keyframe.define({
            name: "rotate2",
            from: {
                transform: "rotate(0deg)",
                height: "268px",
                left: "119px",
                top: "-15px"
            },
            to: {
                transform: "rotate(" + dest + "deg)",
                height: "168px",
                left: "120px",
                top: "35px"
            }
        });
    } else {
        $.keyframe.define({
            name: "rotate2",
            from: {
                transform: "rotate(0deg)",
                height: "352px",
                left: "50%",
                top: "-20px"
            },
            to: {
                transform: "rotate(" + dest + "deg)",
                height: "216px",
                left: "50.5%",
                top: "47px",
            }
        });
    }
    $(ballbg).playKeyframe({
        name: "rotate2", // name of the keyframe you want to bind to the selected element
        duration: temptime, // [optional, default: 0, in ms] how long you want it to last in milliseconds
        timingFunction: "ease-in-out", // [optional, default: ease] specifies the speed curve of the animation
        complete: function () {
            var pData = { 'name': $("input#numwin").val() };
            socket.emit('guestRouletteStopEvent', { "playerId": userId }, function (res) {
            });
        } //[optional]  Function fired after the animation is complete. If repeat is infinite, the function will be fired every time the animation is restarted.
    });
}

function getbgTime(jawheelTime) {
    let rotat = ((rotationsTime * 1000 - 1000) / 1000);
    let dbstart = parseInt((jawheelTime * 1000 - 1000) / 1000);
    return (rotat < dbstart ? temptime = rotat + 's' : temptime = (rotat - dbstart) + 's');
}
function bgrotateTo(deg, jawheelTime) {
    var dest = 360 * wheelSpinTime + deg;
    var temptime = (jawheelTime * 1000 - 1000) / 1000 + 's';

    $.keyframe.define({
        name: "rotate",
        from: {
            transform: "rotate(0deg)"
        },
        to: {
            transform: "rotate(" + dest + "deg)"
        }
    });

    $(numbg).playKeyframe({
        name: "rotate", // name of the keyframe you want to bind to the selected element
        duration: temptime, // [optional, default: 0, in ms] how long you want it to last in milliseconds
        timingFunction: "ease-in-out", // [optional, default: ease] specifies the speed curve of the animation
        complete: function () { } //[optional]  Function fired after the animation is complete. If repeat is infinite, the function will be fired every time the animation is restarted.
    });

    $(toppart).playKeyframe({
        name: "rotate", // name of the keyframe you want to bind to the selected element
        duration: temptime, // [optional, default: 0, in ms] how long you want it to last in milliseconds
        timingFunction: "ease-in-out", // [optional, default: ease] specifies the speed curve of the animation
        complete: function () { } //[optional]  Function fired after the animation is complete. If repeat is infinite, the function will be fired every time the animation is restarted.
    });
}
// crerate me
function randomballrotateTo(deg, jawheelTime) {
    var temptime = jawheelTime + 's';
    var dest = 0 // -360 * ballSpinTime - (360 - deg);
    if ($(window).innerWidth() <= 767) {
        $.keyframe.define({
            name: "rotate2",
            from: {
                transform: "rotate(0deg)",
                height: "268px",
                left: "119px",
                top: "-15px"
            },
            to: {
                transform: "rotate(" + dest + "deg)",
                height: "168px",
                left: "120px",
                top: "35px"
            }
        });
    } else {
        $.keyframe.define({
            name: "rotate2",
            from: {
                transform: "rotate(0deg)",
                height: "352px",
                left: "50%",
                top: "-20px"
            },
            to: {
                transform: "rotate(" + dest + "deg)",
                height: "216px",
                left: "50.5%",
                top: "47px",
            }
        });
    }
    $(ballbg).playKeyframe({
        name: "rotate2",
        duration: temptime,
        timingFunction: "ease-in-out",
    });
}
//create me
function randombgrotateTo(deg, jawheelTime) {
    var dest = 5500000 //360 * wheelSpinTime + deg;
    var temptime = 3000 + 's' // (jawheelTime * 100- 1000) / 1000 + 's';
    $.keyframe.define({
        name: "rotate",
        from: {
            transform: "rotate(0deg)"
        },
        to: {
            transform: "rotate(" + dest + "deg)"
        }
    });
    $(numbg).playKeyframe({
        name: "rotate",
        duration: temptime,
        timingFunction: "ease-in-out",
        complete: function () { }
    });

    $(toppart).playKeyframe({
        name: "rotate",
        duration: temptime,
        timingFunction: "ease-in-out",
        complete: function () { }
    });
}

$('[data-toggle="popover"]').popover({
    placement: 'top',
    trigger: 'click',
    html: true,
    content: function () {
        return $('#popover-content').html();
    }
});


var aud1 = new Audio("/frontend/audio/Laser_Cannon-Mike_Koenig.mp3");
var aud2 = new Audio("/frontend/audio/ray_gun-Mike_Koenig.mp3");
var aud3 = new Audio("/frontend/audio/roulatte-ball.wav");
var aud4 = new Audio("/frontend/audio/torch-Sound.mp3");
var aud5 = new Audio("/frontend/audio/pick-coin.mp3");

(function ($) {
    // table
    (function () {
        "use strict"
        function getButtonCells(btn) {
            var cells = btn.data('cells');
            if (!cells || !cells.length) {
                cells = [];
                switch (btn.data('type')) {
                    case 'sector':
                        var nums = sectors[btn.data('sector')];
                        for (var i = 0, len = nums.length; i < len; i++) {
                            cells.push(table_nums[nums[i]]);
                        }
                        return cells;
                        break;
                    case 'num':
                    default:
                        var nums = String(btn.data('num')).split(',');
                        for (var i = 0, len = nums.length; i < len; i++) {
                            cells.push(table_nums[nums[i]]);
                        }
                        btn.data('cells', cells)
                        return btn.data('cells');
                        break;
                }
            }
            return cells;
        };

        var active = true,
            selectors = {
                roulette: '.roulette',
                num: '.num',
                sector: '.sector',
                table_btns: '.controlls .btn'
            },
            classes = {
                red: 'red',
                black: 'black',
                green: 'green',
                hover: 'hover'
            },
            numbers = {
                red: [],
                black: [],
                green: []
            },
            sectors = {
                '1': [], // 1st row
                '2': [], // 2nd row
                '3': [], // 3rd row
                '4': [], // 1st 12
                '5': [], // 2nd 12
                '6': [], // 3rd 12
                '7': [], // 1 to 18
                '8': [], // EVEN
                '9': [], // RED
                '10': [], // BLACK
                '11': [], // ODD
                '12': [], // 19 to 36
            },
            table_nums = {},
            table_sectors = {};

        // init
        $(selectors.num).each(function () {
            var $this = $(this),
                color,
                num = Number($this.text());
            // add to instances array
            table_nums[num] = $this;
            // add to colors array
            for (var color in numbers) {
                if ($this.hasClass(classes[color])) {
                    numbers[color].push(num);
                    $this.data('color', color);
                }
            }
        })

        $(selectors.sector).each(function () {
            var $this = $(this),
                color;
            if ($this.hasClass(classes.red)) {
                color = 'red';
            } else if ($this.hasClass(classes.black)) {
                color = 'black';
            } else {
                color = 'sector';
            }
            $this.data('color', color);
            table_sectors[$this.data('sector')] = $this;
        });
        // sort numbers
        for (var color in numbers) {
            numbers[color].sort(function (a, b) { return a - b; });
        }
        // populate sectors
        for (var i = 1; i <= 36; i++) {
            // 1st row, 2nd row, 3rd row
            switch (i % 3) {
                case 0:
                    sectors['1'].push(i);
                    break;
                case 1:
                    sectors['3'].push(i);
                    break;
                case 2:
                    sectors['2'].push(i);
                    break;
            }
            // 1st 12, 2nd 12, 3rd 12
            if (i <= 12) {
                sectors['4'].push(i);
            } else if (i <= 24) {
                sectors['5'].push(i);
            } else {
                sectors['6'].push(i);
            }

            // 1 to 18, 19 to 36
            if (i <= 18) {
                sectors['7'].push(i);
            } else {
                sectors['12'].push(i);
            }

            // ODD, EVEN
            if (i % 2) {
                sectors['11'].push(i);
            } else {
                sectors['8'].push(i);
            }

            if (numbers.red.indexOf(i) != -1) {
                sectors['9'].push(i);
            } else if (numbers.black.indexOf(i) != -1) {
                sectors['10'].push(i);
            }
        }

        // buttons
        var table_btns = $(selectors.table_btns).hover(
            function () {
                hovering = 1;
                if (active) {
                    var $this = $(this),
                        cells = getButtonCells($this);
                    for (var i = 0, len = cells.length; i < len; i++) {
                        cells[i].addClass(classes.hover);
                    }
                    var sector = $this.data('sector');
                    if (sector) {
                        table_sectors[sector].addClass(classes.hover);
                    }
                }
            },
            function () {
                hovering = 0;
                var $this = $(this),
                    cells = getButtonCells($this);
                for (var i = 0, len = cells.length; i < len; i++) {
                    cells[i].removeClass(classes.hover);
                }
                var sector = $this.data('sector');
                if (sector) {
                    table_sectors[sector].removeClass(classes.hover);
                }
            }
        ).mousedown(function (e) {
            var numbers = [];
            if (typeof $(this).data('sector') != 'undefined') {
                var selectSector = parseInt($(this).data('sector'));
                addUserBet(selectSector, 1);
                // selectToNumber(data['values'], selectSector);
            } else {
                numbers = $(this).data('num');
                addUserBet(numbers, 0);
            }
        });
    })();

    document.oncontextmenu = function () { if (hovering) return false; };

})(jQuery);
//Select 2 to 1 login
var valchb = [
    { id: "coin_005", value: 0.5 },
    { id: "coin_1", value: 1 },
    { id: "coin_5", value: 5 },
    { id: "coin_25", value: 25 },
    { id: "coin_100", value: 100 },
    { id: "coin_500", value: 500 },
];
function addUserBet(betNo, isSector) {
    btnHidShow(".betDouble", "");
    $(".reBets").addClass("hidediv");
    $(".reBets").attr('disabled', false);
    $(".2xBets").addClass("hidediv");
    $(".2xBets").attr('disabled', false);
    var wid = $(".user_main_balance").data("myval");
    var cid = $(".user_main_balance").data("coinno");

    var getid = $('input[name="bet_amount"]:checked').attr("id");
    var getcoinval = valchb.find((x) => x.id == getid)
    if (!getcoinval) {
        $.toast({ heading: '', text: "Please select valid coin.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }
    // var betAmount = $('input[name="bet_amount"]:checked').val();
    // if (getcoinval.value != betAmount) {
    //   $.toast({ heading: '', text: "Please select valid coin.", position: 'top-right', icon: 'error', stack: false });
    //   return false;
    // }
    var betAmount = getcoinval.value;
    if (userId == null || userId == "" || userId == 0) {
        $.toast({ heading: '', text: "Please login.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }
    if (betAmount == null || betAmount == "" || betAmount == 0) {
        $.toast({ heading: '', text: "Please select coin.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }
    if (betAmount < 0) {
        $.toast({ heading: '', text: "You can't place bet. Please reload game and places bet.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }

    let color = '';
    if (numblack.includes(parseInt(betNo)) == true) {
        color = 'black';
    } else if (numred.includes(parseInt(betNo)) == true) {
        color = 'red';
    } else if (betNo == "0") {
        color = 'green';
    }
    // console.log(CurrencyMaster);  
    let getCurrency = CurrencyMaster.find((c) => c.id == cid)
    let betHistory = {
        'chipsNumber': betAmount,
        'bet_amount': parseFloat(betAmount),
        'chipsBetAmount': parseFloat(parseFloat(betAmount) / parseFloat(getCurrency.chipsAmount)),
        'selected_color': color,
        'selectedNumber': (isSector == 1) ? "" : betNo,
        'net_winning_amout': 0,
        'winning_amount': 0,
        'is_won': 'pending',
        'isSector': isSector,
        'sectorNo': (isSector == 1) ? betNo : 0,
        'game_id': window.rid,
        'user_id': userId,
        'wallete_id': wid
    }

    let history = {
        'chipsNumber': betAmount,
        'bet_amount': parseFloat(betAmount),
        'chipsBetAmount': parseFloat(parseFloat(betAmount) / parseFloat(getCurrency.chipsAmount)),
        'selected_color': color,
        'selectedNumber': (isSector == 1) ? "" : betNo,
        'net_winning_amout': 0,
        'winning_amount': 0,
        'is_won': 'pending',
        'isSector': isSector,
        'sectorNo': (isSector == 1) ? betNo : 0,
        'game_id': window.rid,
        'user_id': userId,
        'wallete_id': wid
    }
    if (isSector == 1) {
        let isExit = placeBetObj.playerSelectBet.findIndex((i) => i.sectorNo == betNo && i.isSector == 1);
        if (isExit < 0) {
            placeBetObj.playerSelectBet.push(betHistory);
            placeBetObj.playerSelectBetHistory.push(history);
            placeBetObj.totalBetAmount += parseFloat(history.bet_amount);
            placeBetObj.totalChipsBetAmount += parseFloat(history.chipsBetAmount);

            $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
            selectConinUISelector(betNo, history.bet_amount, history.selected_color, history.chipsNumber, history.isSector);
        } else {
            let checkBet = placeBetObj.playerSelectBet.findIndex((i) => i.sectorNo == betNo && i.isSector == isSector && i.sectorNo == betHistory.sectorNo);
            if (checkBet < 0) {
                placeBetObj.playerSelectBet.push(betHistory);
                placeBetObj.playerSelectBetHistory.push(history);
                placeBetObj.totalBetAmount += parseFloat(history.bet_amount);
                placeBetObj.totalChipsBetAmount += parseFloat(history.chipsBetAmount);

                $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))

                selectConinUISelector(betNo, history.bet_amount, history.selected_color, history.chipsNumber, history.isSector);

            } else {
                placeBetObj.playerSelectBet[checkBet].chipsNumber = betHistory.chipsNumber;
                placeBetObj.playerSelectBet[checkBet].bet_amount = placeBetObj.playerSelectBet[checkBet].bet_amount + parseFloat(betHistory.bet_amount);
                placeBetObj.playerSelectBet[checkBet].chipsBetAmount = placeBetObj.playerSelectBet[checkBet].chipsBetAmount + parseFloat(betHistory.chipsBetAmount);


                placeBetObj.playerSelectBetHistory.push(history);
                placeBetObj.totalBetAmount += parseFloat(history.bet_amount);
                placeBetObj.totalChipsBetAmount += parseFloat(history.chipsBetAmount);
                $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
                selectConinUISelector(betNo, placeBetObj.playerSelectBet[checkBet].bet_amount, history.selected_color, history.chipsNumber, history.isSector);
            }
        }
    } else {
        let isExit = placeBetObj.playerSelectBet.findIndex((i) => i.selectedNumber == betNo && i.isSector == 0);
        if (isExit < 0) {
            placeBetObj.playerSelectBet.push(betHistory);
            placeBetObj.playerSelectBetHistory.push(history);
            placeBetObj.totalBetAmount += parseFloat(history.bet_amount);
            placeBetObj.totalChipsBetAmount += parseFloat(history.chipsBetAmount);

            $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
            selectConinUISelector(history.selectedNumber, history.bet_amount, history.selected_color, history.chipsNumber, history.isSector);

        } else {
            placeBetObj.playerSelectBet[isExit].chipsNumber = betHistory.chipsNumber;
            placeBetObj.playerSelectBet[isExit].bet_amount = placeBetObj.playerSelectBet[isExit].bet_amount + parseFloat(betHistory.bet_amount);
            placeBetObj.playerSelectBet[isExit].chipsBetAmount = placeBetObj.playerSelectBet[isExit].chipsBetAmount + parseFloat(betHistory.chipsBetAmount);

            placeBetObj.playerSelectBetHistory.push(history);
            placeBetObj.totalBetAmount += parseFloat(history.bet_amount);
            placeBetObj.totalChipsBetAmount += parseFloat(history.chipsBetAmount);

            $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
            selectConinUISelector(history.selectedNumber, placeBetObj.playerSelectBet[isExit].bet_amount, history.selected_color, history.chipsNumber, history.isSector);
        }

    }
    localStorage.setItem("guestPlayerPlaceBetObj", JSON.stringify(placeBetObj));

    showWinBetDiv("show");
}

var squares = new Array(48);
var divs = document.getElementsByTagName("div");
for (var i = 0; i < divs.length; i++) {
    var attr = divs[i].getAttribute("data-num");
    if (attr == null) {
        attr = divs[i].getAttribute("data-sector");
        if (attr == null) continue;
        var index = 36 + parseInt(attr);

        var rekt = divs[i].getBoundingClientRect();
        squares[index] = new Array(2);
        squares[index][1] = rekt.top + 10;
        squares[index][0] = rekt.left + 16;
    } else {
        if (attr.indexOf(',') != -1) continue;
        var rekt = divs[i].getBoundingClientRect();
        squares[attr] = new Array(2);
        squares[attr][1] = rekt.top + 10;
        squares[attr][0] = rekt.left + 16;
    }
}

function TotalBets(id) {
    var r = 0;
    if (bets[id] == 0) {
        return r = bets[id];
    } else {
        return r += bets[id];
    }
}

function rInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var chips = new Array(48);

var balance = 1;
var CurrentTier = 0.01;
var tiers = [
    0.0001,
    0.0002,
    0.001,
    0.002,
    0.01,
    0.02
];

var sectors = [
    "3rd column",
    "2nd column",
    "1st column",
    "1st 12",
    "2nd 12",
    "3rd 12",
    "1 to 18",
    "Even",
    "Red",
    "Black",
    "Odd",
    "19 to 36"
];

var hovering = 0;


document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        localStorage.setItem("exittime", moment().add(180, 'seconds').format());
    } else {
        if (localStorage.getItem("exittime")) {
            checkDate(localStorage.getItem("exittime"));
        }

        if (!localStorage.getItem("betsDetail") || localStorage.getItem("betsDetail") == null) {
            $(".reBets").addClass("hidediv");
            $(".reBets").attr('disabled', true);
            $(".2xBets").addClass("hidediv");
            $(".2xBets").attr('disabled', true);
        }
    }
}, false);

function checkDate(exittime) {
    if (moment().isAfter(moment(exittime))) {
        resetGameLobby();
        localStorage.removeItem("betsDetail");
        localStorage.removeItem("exittime");
        window.location.reload();
    } else if (moment().isSame(moment(exittime))) {
    } else if (moment().isBefore(moment(exittime))) {
    }
}

$(document).ready(function () {
    getCurreyData();
    btnHidShow("", ".betDouble");
    if (userId) {
        lightingrouletRefreshteGame();
        lastGameHistory();
        betStopNumberHistoryforGuest();
    }
    if (!localStorage.getItem("betsDetail") || localStorage.getItem("betsDetail") == null) {
        $(".reBets").addClass("hidediv");
        $(".reBets").attr('disabled', true);
        $(".2xBets").addClass("hidediv");
        $(".2xBets").attr('disabled', true);
    }
    // console.log(localStorage.getItem("betsDetail"));
});

/*Start: Timer Nounce*/
var nounce = null
var timerInterval;

var updateTimer = function () {
    nounce = moment(new Date()).format("hh:mm:ss");
    $(".counterTimer").text(nounce);
};
var startTimer = () => {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(updateTimer, 1000);
}

$(document).ready(function () {
    updateTimer();
    startTimer();
});

/*End: Timer Nounce*/


/*Start: Get Chips Data */
function getCurreyData() {
    window.CurrencyMaster = [{
        id: 5,
        currency_name: "ROUL1",
        currency_image: "select-chip.png",
        chipsAmount: 1
    }];
}
/*End:  End Game */

// create me - Start : betStopNumberHistoryforGuest
function betStopNumberHistoryforGuest() {
    if (localStorage.guestGame) {

        $("table.red-black").show();
        $("table.even-odd").show();
        $("table.1-18to19-36").show();
        $("table.leftMddRight").show(); 
        $("table.betweenTwelveNumber").show();

        var guestGameData = JSON.parse(localStorage.guestGame)

        let redBlack
        let evenOdd
        let betweenNumber
        let leftMiddRight
        let betweenNumberTwelve

        var count = 0
        for (i = guestGameData.length - 1; i >= 0; i--) {
            if (count >= 5) {
                break;
            }
            if (guestGameData[i].stopped_on_number) {
                count++

                // Red or Black
                if (numred.includes(parseInt(guestGameData[i].stopped_on_number))) {
                    redBlack += '<tr><td>'+guestGameData[i].stopped_on_number+'</td><td></td></tr>'
                } else {
                    redBlack += '<tr><td></td><td>'+guestGameData[i].stopped_on_number+'</td></tr>'
                }

                // Even or Odd
                if (guestGameData[i].stopped_on_number % 2 == 0) {
                    evenOdd += '<tr><td>'+guestGameData[i].stopped_on_number+'</td><td></td></tr>'
                } else {
                    evenOdd += '<tr><td></td><td>'+guestGameData[i].stopped_on_number+'</td></tr>'
                }

                // 1-18 to 19-36
                if (first1to18.includes(parseInt(guestGameData[i].stopped_on_number))) {
                    betweenNumber += '<tr><td>'+guestGameData[i].stopped_on_number+'</td><td></td></tr>'
                } else {
                    betweenNumber += '<tr><td></td><td>'+guestGameData[i].stopped_on_number+'</td></tr>'
                }

                // Left Midd Right
                if (left.includes(parseInt(guestGameData[i].stopped_on_number))) {
                    leftMiddRight += '<tr><td>'+guestGameData[i].stopped_on_number+'</td><td></td><td></td></tr>'
                } else if (right.includes(parseInt(guestGameData[i].stopped_on_number))) {
                    leftMiddRight += '<tr><td></td><td></td><td>'+guestGameData[i].stopped_on_number+'</td></tr>'
                } else {
                    leftMiddRight += '<tr><td></td><td>'+guestGameData[i].stopped_on_number+'</td><td></td></tr>'
                }

                // 1st12 2nd12 3rd12
                if (firstTwelve.includes(parseInt(guestGameData[i].stopped_on_number))) {
                    betweenNumberTwelve += '<tr><td>'+guestGameData[i].stopped_on_number+'</td><td></td><td></td></tr>'
                } else if (secondTwelve.includes(parseInt(guestGameData[i].stopped_on_number))) {
                    betweenNumberTwelve += '<tr><td></td><td>'+guestGameData[i].stopped_on_number+'</td><td></td></tr>'
                } else {
                    betweenNumberTwelve += '<tr><td></td><td></td><td>'+guestGameData[i].stopped_on_number+'</td></tr>'
                }

            }

        }
        $("table.red-black tbody").html(redBlack);
        $("table.even-odd tbody").html(evenOdd);
        $("table.1-18to19-36 tbody").html(betweenNumber);
        $("table.leftMddRight tbody").html(leftMiddRight);
        $("table.betweenTwelveNumber tbody").html(betweenNumberTwelve);

    } else {
        $("table.red-black").hide();
        $("table.even-odd").hide();
        $("table.1-18to19-36").hide();
        $("table.leftMddRight").hide(); 
        $("table.betweenTwelveNumber").hide();
    }

}
// End : betStopNumberHistoryforGuest

//Start lighting Roulette page refresh
function lightingrouletRefreshteGame() {
    socket.emit('guestReconnectGame', { "playerId": userId }, function (res) {
        if (res.status == "success") {
            gamelobyUpdate(res.data.game);
            $(".lastStop").text(""); //x 
            $(".lastWin").text("0"); //x
            if (res.data.game_status == "started") {
                showWinBetDiv("show");
                var betHi = res.data.history;
                if (betHi.length > 0) {
                    placeBetObj.playerSelectBet = betHi;
                    placeBetObj.playerSelectBetHistory = betHi;
                    for (var h = 0; h < betHi.length; h++) {
                        if (betHi[h].isSector == "0") {
                            selectConinUISelector(betHi[h].selectedNumber, betHi[h].bet_amount, betHi[h].selected_color, betHi[h].chipsNumber, betHi[h].isSector);
                        } else {
                            selectConinUISelector(betHi[h].sectorNo, betHi[h].bet_amount, betHi[h].selected_color, betHi[h].chipsNumber, betHi[h].isSector);
                        }
                    }
                }
                $(".rullateLobby").attr("style", "pointer-events: none;");
                $(".anim-object").addClass("slide-rotate-hor-t-fwd").removeClass("slide-rotate-hor-b-fwd");
                $('.table_coins_timer').hide();
                btnHidShow(".betDouble", "");
                $(".lobby").addClass("blockdiv");
                $(".coin-btn").addClass("blockdiv");
                $(".reBets").addClass("hidediv");
                $(".2xBets").addClass("hidediv");
                $(".place_bet_light_roulette").addClass("active");
                // $(".tbl_timer h3").text("OK");        
                disableBet();
            } else {
                var betHi = res.data.history;
                if (betHi.length > 0) {
                    $(".lobby").addClass("blockdiv");
                    $(".coin-btn").addClass("blockdiv");

                    placeBetObj.playerSelectBet = betHi;
                    placeBetObj.playerSelectBetHistory = betHi;
                    for (var h = 0; h < betHi.length; h++) {
                        if (betHi[h].isSector == "0") {
                            selectConinUISelector(betHi[h].selectedNumber, betHi[h].bet_amount, betHi[h].selected_color, betHi[h].chipsNumber, betHi[h].isSector);
                        } else {
                            selectConinUISelector(betHi[h].sectorNo, betHi[h].bet_amount, betHi[h].selected_color, betHi[h].chipsNumber, betHi[h].isSector);
                        }
                    }
                    $(".reBets").addClass("hidediv");
                    $(".2xBets").addClass("hidediv");
                    $(".place_bet_light_roulette").addClass("active");
                    $(".lobby").addClass("blockdiv");
                    $(".coin-btn").addClass("blockdiv");
                    // if (res.data.game.stopped_on_number) {
                    //   // spinTo(res.data.game.stopped_on_number, 15000);
                    // } else {
                    //   socket.emit("spinRoulette", { "playerId": userId }, (res) => { });
                    // }
                } else {
                    if (!localStorage.getItem("betsDetail") || localStorage.getItem("betsDetail") == null) {
                        $(".reBets").attr('disabled', true);
                        $(".reBets").addClass("hidediv");
                        $(".2xBets").attr('disabled', true);
                        $(".2xBets").addClass("hidediv");
                    } else {
                        $(".reBets").attr('disabled', false);
                        $(".reBets").removeClass("hidediv");
                        $(".2xBets").attr('disabled', false);
                        $(".2xBets").removeClass("hidediv");
                    }
                    // showWinBetDiv("hide");
                    resetBoard();
                    resetGameLobby();
                    if (localStorage.guestPlayerPlaceBetObj) {
                        var getOlddata = JSON.parse(localStorage.guestPlayerPlaceBetObj)
                        placeBetObj.playerSelectBet = getOlddata.playerSelectBet;
                        placeBetObj.playerSelectBetHistory = getOlddata.playerSelectBetHistory;
                        placeBetObj.totalBetAmount = getOlddata.totalBetAmount;
                        placeBetObj.totalChipsBetAmount = getOlddata.totalChipsBetAmount;
                        for (var h = 0; h < placeBetObj.playerSelectBet.length; h++) {
                            if (placeBetObj.playerSelectBet[h].isSector == "0") {
                                selectConinUISelector(placeBetObj.playerSelectBet[h].selectedNumber, placeBetObj.playerSelectBet[h].bet_amount, placeBetObj.playerSelectBet[h].selected_color, placeBetObj.playerSelectBet[h].chipsNumber, placeBetObj.playerSelectBet[h].isSector);
                            } else {
                                selectConinUISelector(placeBetObj.playerSelectBet[h].sectorNo, placeBetObj.playerSelectBet[h].bet_amount, placeBetObj.playerSelectBet[h].selected_color, placeBetObj.playerSelectBet[h].chipsNumber, placeBetObj.playerSelectBet[h].isSector);
                            }
                        }
                        $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2));
                        btnHidShow(".betDouble", "");
                    }
                }
                // btnHidShow(".reBets", ".betDouble");
            }
        } else {
            $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false });
        }
    });
}
//End lighting Roulette page refresh

$(".clearBets").click(function () {
    clearBets();
});
function btnHidShow(btnShow, btnHide) {
    $(btnHide).hide();
    $(btnShow).show();
}
//,.2xBets
$('.betDouble').click(function () {
    var mailBla = $('.user_main_balance').text();
    if (placeBetObj.playerSelectBetHistory.length <= 0) {
        btnHidShow("", ".betDouble");
        $.toast({ heading: '', text: "Please select bet number.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }
    if (parseFloat(mailBla) < parseFloat(parseFloat(placeBetObj.totalChipsBetAmount) * 2)) {
        $.toast({ heading: '', text: "Insufficient chips in your wallet.", position: 'top-right', icon: 'error', stack: false });
    }
    var totalNewAmout = 0;
    var totalNewChipsBet = 0;
    for (let ii = 0; ii < placeBetObj.playerSelectBet.length; ii++) {
        placeBetObj.playerSelectBet[ii].bet_amount = parseFloat(placeBetObj.playerSelectBet[ii].bet_amount) * 2;
        placeBetObj.playerSelectBet[ii].chipsBetAmount = parseFloat(placeBetObj.playerSelectBet[ii].chipsBetAmount) * 2;
        totalNewAmout += placeBetObj.playerSelectBet[ii].bet_amount;
        totalNewChipsBet += placeBetObj.playerSelectBet[ii].chipsBetAmount;
        if (placeBetObj.playerSelectBet[ii].isSector == 1) {
            selectConinUISelector(placeBetObj.playerSelectBet[ii].sectorNo, placeBetObj.playerSelectBet[ii].bet_amount, placeBetObj.playerSelectBet[ii].selected_color, placeBetObj.playerSelectBet[ii].chipsNumber, placeBetObj.playerSelectBet[ii].isSector);
        }
        if (placeBetObj.playerSelectBet[ii].isSector == 0) {
            selectConinUISelector(placeBetObj.playerSelectBet[ii].selectedNumber, placeBetObj.playerSelectBet[ii].bet_amount, placeBetObj.playerSelectBet[ii].selected_color, placeBetObj.playerSelectBet[ii].chipsNumber, placeBetObj.playerSelectBet[ii].isSector);
        }
    }

    for (let h = 0; h < placeBetObj.playerSelectBetHistory.length; h++) {
        placeBetObj.playerSelectBetHistory[h].bet_amount = parseFloat(placeBetObj.playerSelectBetHistory[h].bet_amount) * 2;
        placeBetObj.playerSelectBetHistory[h].chipsBetAmount = parseFloat(placeBetObj.playerSelectBetHistory[h].chipsBetAmount) * 2;
    }

    placeBetObj.totalBetAmount = totalNewAmout;
    placeBetObj.totalChipsBetAmount = totalNewChipsBet;
    $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2));

    localStorage.setItem("guestPlayerPlaceBetObj", JSON.stringify(placeBetObj));

});

function selectConinUISelector(id, totalAmountBet, selectColor, selectAmountNo, isSelectFlag) {
    var img = document.createElement('img');
    var img = document.createElement('img');
    let imgno = '';
    if (selectAmountNo == 0.5) {
        imgno = 4;
    } else if (selectAmountNo == 5) {
        imgno = 6;
    } else if (selectAmountNo == 25) {
        imgno = 2;
    } else if (selectAmountNo == 100) {
        imgno = 8;
    } else if (selectAmountNo == 500) {
        imgno = 5;
    } else if (selectAmountNo == 2000) {
        imgno = 9;
    } else if (selectAmountNo == 1) {
        imgno = 1;
    }
    img.src = "/frontend/img/chips-black" + imgno + ".png";
    img.style.zIndex = "0";
    img.style.position = "absolute";
    var rX = rInt(-298, -298);
    var rY = rInt(-245, -245);

    img.style.left = (squares[id][0] + rX) + "px";
    img.style.top = (squares[id][1] + rY) + "px";

    //console.log("img.style.left : ",img.style.left,"  img.style.top :", img.style.top)

    img.style.width = "20px";
    img.style.pointerEvents = "none";

    var len = parseFloat(totalAmountBet).toString().length;
    // console.log("lenth of string :"+ len);
    var left_px = '6px';
    var font_px = '11px';
    var top_px = '3px';
    if (len > 1) {
        left_px = '3px';
    }
    if (len > 2) {
        font_px = '9px';
    }
    if (len > 3) {
        font_px = '7px';
        top_px = '4px';
    }
    if (isSelectFlag == 1) {
        var findId = '[data-num=selector' + id + ']';
        var pClass = 'set-selector' + id;
    } else {
        var findId = '[data-num=' + id + ']';
        var pClass = 'set' + id;
    }

    $('.controlls').find(pClass).remove();
    $("div.add-chips" + id).remove();
    $('.controlls').find(findId).html("<p class='" + pClass + "'><span class='setor" + id + "'>" + parseFloat(totalAmountBet) + "</span><img class='select-chip' src='/frontend/img/chips-black" + imgno + ".png' width='30px' /></p>");

    $('.add-chips' + id).append(img);
    $("p.set" + id + "").css({
        'color': '#ffff',
        'position': 'absolute',
        'left': '5px',
        'z-index': '9999999999',
        'text-align': 'center',
        'top': '5px',
        'font-weight': '900',
        'font-size': '5px',
    });
    $("span.setor" + id + "").css({
        'color': '#ffff',
        'position': 'absolute',
        'left': left_px,
        'z-index': '9999999999',
        'text-align': 'center',
        'top': top_px,
        'font-weight': '900',
        'font-size': font_px,
    });

    if (chips[id] == null) chips[id] = new Array(0);
    chips[id].push(img);

    let selvVal = '';
    if (selectAmountNo == "0.5") {
        selvVal = '005';
    } else {
        selvVal = selectAmountNo;
    }

    $("#coin_" + selvVal).prop('checked', 'checked');
    $('input[name="selected_color"]').val(selectColor);
    $("input[name='bet_number']").val(id);
    return true;
}

$(".undoBets").click(function () {
    undoBetsData();
});

function undoBetsData() {
    if (placeBetObj.playerSelectBetHistory.length > 0) {
        var getLength = placeBetObj.playerSelectBetHistory.length;
        var rmIndex = placeBetObj.playerSelectBetHistory[getLength - 1];
        if (rmIndex) {
            var preHisto = [];
            if (rmIndex.isSector == 1) {
                for (var r = placeBetObj.playerSelectBetHistory.length - 1; r >= 0; r--) {
                    if (placeBetObj.playerSelectBetHistory[r].sectorNo == rmIndex.sectorNo && placeBetObj.playerSelectBetHistory[r].isSector == rmIndex.isSector) {
                        preHisto.push(placeBetObj.playerSelectBetHistory[r]);
                    }
                }

                var getNoIndex = placeBetObj.playerSelectBet.findIndex((i) => i.sectorNo == rmIndex.sectorNo && i.isSector == rmIndex.isSector);
                if (getNoIndex >= 0) {
                    if (preHisto.length <= 1) {
                        placeBetObj.playerSelectBet.splice(getNoIndex, 1);
                        placeBetObj.totalBetAmount = parseFloat(placeBetObj.totalBetAmount) - parseFloat(rmIndex.bet_amount);
                        placeBetObj.totalChipsBetAmount = parseFloat(placeBetObj.totalChipsBetAmount) - parseFloat(rmIndex.chipsBetAmount)
                        removeCoinUISelection(rmIndex.sectorNo, rmIndex.isSector);
                    } else {
                        var nwRecord = preHisto[1];
                        placeBetObj.playerSelectBet[getNoIndex].chipsNumber = nwRecord.chipsNumber;
                        placeBetObj.playerSelectBet[getNoIndex].bet_amount = parseFloat(placeBetObj.playerSelectBet[getNoIndex].bet_amount) - parseFloat(rmIndex.bet_amount);
                        placeBetObj.playerSelectBet[getNoIndex].chipsBetAmount = parseFloat(placeBetObj.playerSelectBet[getNoIndex].chipsBetAmount) - parseFloat(rmIndex.chipsBetAmount);

                        placeBetObj.totalBetAmount = parseFloat(placeBetObj.totalBetAmount) - parseFloat(rmIndex.bet_amount);
                        placeBetObj.totalChipsBetAmount = parseFloat(placeBetObj.totalChipsBetAmount) - parseFloat(rmIndex.chipsBetAmount)

                        selectConinUISelector(placeBetObj.playerSelectBet[getNoIndex].sectorNo, placeBetObj.playerSelectBet[getNoIndex].bet_amount, placeBetObj.playerSelectBet[getNoIndex].selected_color, placeBetObj.playerSelectBet[getNoIndex].chipsNumber, placeBetObj.playerSelectBet[getNoIndex].isSector);
                    }
                    placeBetObj.playerSelectBetHistory.splice(getLength - 1, 1);
                    $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
                }
            } else {
                for (var r = placeBetObj.playerSelectBetHistory.length - 1; r >= 0; r--) {
                    if (placeBetObj.playerSelectBetHistory[r].selectedNumber == rmIndex.selectedNumber && placeBetObj.playerSelectBetHistory[r].isSector == rmIndex.isSector) {
                        preHisto.push(placeBetObj.playerSelectBetHistory[r]);
                    }
                }
                var getNoIndIndex = placeBetObj.playerSelectBet.findIndex((i) => i.selectedNumber == rmIndex.selectedNumber && i.isSector == rmIndex.isSector);
                if (getNoIndIndex >= 0) {
                    if (preHisto.length <= 1) {
                        placeBetObj.playerSelectBet.splice(getNoIndIndex, 1);
                        placeBetObj.totalBetAmount = parseFloat(placeBetObj.totalBetAmount) - parseFloat(rmIndex.bet_amount);
                        placeBetObj.totalChipsBetAmount = parseFloat(placeBetObj.totalChipsBetAmount) - parseFloat(rmIndex.chipsBetAmount)
                        removeCoinUISelection(rmIndex.selectedNumber, rmIndex.isSector);

                    } else {
                        var nwRecord = preHisto[1];
                        placeBetObj.playerSelectBet[getNoIndIndex].chipsNumber = nwRecord.chipsNumber;
                        placeBetObj.playerSelectBet[getNoIndIndex].bet_amount = parseFloat(placeBetObj.playerSelectBet[getNoIndIndex].bet_amount) - parseFloat(rmIndex.bet_amount);
                        placeBetObj.playerSelectBet[getNoIndIndex].chipsBetAmount = parseFloat(placeBetObj.playerSelectBet[getNoIndIndex].chipsBetAmount) - parseFloat(rmIndex.chipsBetAmount);

                        placeBetObj.totalBetAmount = parseFloat(placeBetObj.totalBetAmount) - parseFloat(rmIndex.bet_amount);

                        placeBetObj.totalChipsBetAmount = parseFloat(placeBetObj.totalChipsBetAmount) - parseFloat(rmIndex.chipsBetAmount)

                        selectConinUISelector(placeBetObj.playerSelectBet[getNoIndIndex].selectedNumber, placeBetObj.playerSelectBet[getNoIndIndex].bet_amount, placeBetObj.playerSelectBet[getNoIndIndex].selected_color, placeBetObj.playerSelectBet[getNoIndIndex].chipsNumber, placeBetObj.playerSelectBet[getNoIndIndex].isSector);
                    }
                    placeBetObj.playerSelectBetHistory.splice(getLength - 1, 1);
                    $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
                }
            }
            if (placeBetObj.playerSelectBetHistory.length <= 0) {
                if (localStorage.getItem("betsDetail")) {
                    $(".reBets").removeClass("hidediv");
                    $(".reBets").attr('disabled', false);
                    $(".2xBets").removeClass("hidediv");
                    $(".2xBets").attr('disabled', false);
                }
            }

            localStorage.setItem("guestPlayerPlaceBetObj", JSON.stringify(placeBetObj));
        }
    } else {
        btnHidShow("", ".betDouble");
        $.toast({ heading: '', text: "Please select bet number.", position: 'top-right', icon: 'error', stack: false });
    }
}

function removeCoinUISelection(id, isSector) {
    if (isSector == 1) {
        var findId = '.set-selector' + id;
    } else {
        var findId = '.set' + id;
    }
    $('.controlls').find(findId).remove();
}

$(".samSpinbtn").click(function () {
    clearInterval(timerInterval);

    clearTimeout(setPopupTimeOut);
    setPopupTimeOut = setTimeout(function () {
        $(".samebetlistshow").removeClass("spin-open");
    }, 3000);

    clearTimeout(setScollerTimer);
    setScollerTimer = setTimeout(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
    }, 3000);

    getLastBetData(false);
});
$(".samTarbobtn").click(function () {
    clearInterval(timerInterval);

    clearTimeout(setPopupTimeOut);
    setPopupTimeOut = setTimeout(function () {
        $(".samebetlistshow").removeClass("spin-open");
    }, 3000);

    clearTimeout(setScollerTimer);
    setScollerTimer = setTimeout(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
    }, 3000);
    getLastBetData(true);
});

function getLastBetData(isTurbo) {
    var previousBetDetails = localStorage.getItem("betsDetail");
    if (previousBetDetails) {
        previousBets = JSON.parse(previousBetDetails);
        resetBoard();
        if (previousBets.playerSelectBet.length > 0) {
            if (previousBets.playerSelectBet[0].user_id == userId) {
                for (var pre of previousBets.playerSelectBet) {
                    if (pre.isSector == 1) {
                        selectConinUISelector(pre.sectorNo, pre.bet_amount, pre.selected_color, pre.chipsNumber, pre.isSector);
                    } else {
                        selectConinUISelector(pre.selectedNumber, pre.bet_amount, pre.selected_color, pre.chipsNumber, pre.isSector);
                    }
                    pre.game_id = window.rid;
                }
                placeBetObj.totalBetAmount = parseFloat(previousBets.totalBetAmount);
                placeBetObj.totalChipsBetAmount = parseFloat(previousBets.totalChipsBetAmount);
                placeBetObj.playerSelectBet = previousBets.playerSelectBet;
                placeBetObj.playerSelectBetHistory = previousBets.playerSelectBetHistory;

                $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
                sameBetSpin(isTurbo, placeBetObj);
            }
        }

        localStorage.setItem("guestPlayerPlaceBetObj", JSON.stringify(placeBetObj));
    } else {
        $(".samebetlistshow").attr('disabled', false);
        clearTimeout(setScollerTimer);
        $(".samebetlistshow").removeClass("blockdiv");
        $.toast({ heading: '', text: "Previous game bet history not found. ", position: 'top-right', icon: 'error', stack: false });
    }
}


$('.2xBets').click(function () {
    if (!userId) {
        $.toast({ heading: '', text: "Please login.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }
    var previousBetDetails = JSON.parse(localStorage.getItem("betsDetail"))
    var mailBla = $('.user_main_balance').text();

    if (previousBetDetails.playerSelectBetHistory.length <= 0) {
        btnHidShow("", ".betDouble");
        btnHidShow(".2xBets", "");
        $.toast({ heading: '', text: "Please select bet number.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }

    if (parseFloat(mailBla) < parseFloat(parseFloat(previousBetDetails.totalChipsBetAmount) * 2)) {
        $.toast({ heading: '', text: "Insufficient chips in your wallet.", position: 'top-right', icon: 'error', stack: false });
    }

    var totalNewAmout = 0;
    var totalNewChipsBet = 0;

    for (let ii = 0; ii < previousBetDetails.playerSelectBet.length; ii++) {
        previousBetDetails.playerSelectBet[ii].bet_amount = parseFloat(previousBetDetails.playerSelectBet[ii].bet_amount) * 2;
        previousBetDetails.playerSelectBet[ii].chipsBetAmount = parseFloat(previousBetDetails.playerSelectBet[ii].chipsBetAmount) * 2;
        totalNewAmout += previousBetDetails.playerSelectBet[ii].bet_amount;
        totalNewChipsBet += previousBetDetails.playerSelectBet[ii].chipsBetAmount;
        if (previousBetDetails.playerSelectBet[ii].isSector == 1) {
            selectConinUISelector(previousBetDetails.playerSelectBet[ii].sectorNo, previousBetDetails.playerSelectBet[ii].bet_amount, previousBetDetails.playerSelectBet[ii].selected_color, previousBetDetails.playerSelectBet[ii].chipsNumber, previousBetDetails.playerSelectBet[ii].isSector);
        }
        if (previousBetDetails.playerSelectBet[ii].isSector == 0) {
            selectConinUISelector(previousBetDetails.playerSelectBet[ii].selectedNumber, previousBetDetails.playerSelectBet[ii].bet_amount, previousBetDetails.playerSelectBet[ii].selected_color, previousBetDetails.playerSelectBet[ii].chipsNumber, previousBetDetails.playerSelectBet[ii].isSector);
        }
    }

    for (let h = 0; h < previousBetDetails.playerSelectBetHistory.length; h++) {
        previousBetDetails.playerSelectBetHistory[h].bet_amount = parseFloat(previousBetDetails.playerSelectBetHistory[h].bet_amount) * 2;
        previousBetDetails.playerSelectBetHistory[h].chipsBetAmount = parseFloat(previousBetDetails.playerSelectBetHistory[h].chipsBetAmount) * 2;
    }

    previousBetDetails.totalBetAmount = totalNewAmout;
    previousBetDetails.totalChipsBetAmount = totalNewChipsBet;
    $(".noBets").text(parseFloat(previousBetDetails.totalBetAmount).toFixed(2));

    localStorage.setItem("guestPlayerpreviousBetDetails", JSON.stringify(previousBetDetails));


    // return false;
    var previousBetDetails2 = localStorage.getItem("guestPlayerpreviousBetDetails");

    if (previousBetDetails2) {
        previousBets = JSON.parse(previousBetDetails2);

        // resetBoard();
        if (previousBets.playerSelectBet.length >= 0) {

            if (previousBets.playerSelectBet[0].user_id == userId) {

                for (var pre of previousBets.playerSelectBet) {

                    if (pre.isSector == 1) {
                        selectConinUISelector(pre.sectorNo, pre.bet_amount, pre.selected_color, pre.chipsNumber, pre.isSector);
                    } else {
                        selectConinUISelector(pre.selectedNumber, pre.bet_amount, pre.selected_color, pre.chipsNumber, pre.isSector);
                    }
                    pre.game_id = window.rid;

                }

                placeBetObj.totalBetAmount = parseFloat(previousBets.totalBetAmount);
                placeBetObj.totalChipsBetAmount = parseFloat(previousBets.totalChipsBetAmount);
                placeBetObj.playerSelectBet = previousBets.playerSelectBet;
                placeBetObj.playerSelectBetHistory = previousBets.playerSelectBetHistory;

                $(".noBets").text(parseFloat(placeBetObj.totalBetAmount).toFixed(2))
                // $(".reBets").addClass("hidediv");

                sameBetSpin('', placeBetObj);
            }

        }
        localStorage.setItem("playerPlaceBetObj", JSON.stringify(placeBetObj));
    } else {
        $(".reBets").attr('disabled', false);
        $.toast({ heading: '', text: "Previous game bet history not found. ", position: 'top-right', icon: 'error', stack: false });
    }

})

$('.reBets').click(function () {
    if (!userId) {
        $.toast({ heading: '', text: "Please login.", position: 'top-right', icon: 'error', stack: false });
        return false;
    }
    return false;
});


function resetBoard() {
    btnHidShow("", ".betDouble");
    $('input[name="total_bets"]').val('');
    $('input[name="bet_number"]').val('');
    $('input[name="selected_color"]').val('');

    for (let ii = 0; ii < placeBetObj.playerSelectBet.length; ii++) {
        if (placeBetObj.playerSelectBet[ii].isSector == 1) {
            removeCoinUISelection(placeBetObj.playerSelectBet[ii].sectorNo, placeBetObj.playerSelectBet[ii].isSector);
        } else {
            removeCoinUISelection(placeBetObj.playerSelectBet[ii].selectedNumber, placeBetObj.playerSelectBet[ii].isSector);
        }
    }
    placeBetObj.playerSelectBet = []
    placeBetObj.playerSelectBetHistory = [];
    placeBetObj.totalBetAmount = 0;
    placeBetObj.totalChipsBetAmount = 0;
}


function removeDataSelector(dataId) {
    $('.controlls').find('[data-sector="' + dataId + '"] >p').remove();
}
function clearBets() {
    btnHidShow("", ".betDouble");
    $('input[name="total_bets"]').val('');
    $('input[name="bet_number"]').val('');
    $('input[name="selected_color"]').val('');
}

function disableBet() {
    localStorage.removeItem("guestPlayerPlaceBetObj");
    $('.place_bet_light_roulette').attr('disabled', true);
    $(".reBets").attr('disabled', true);
    $(".2xBets").attr('disabled', true);
    // $('.place_bet_light_roulette').html('Wait for next round.s');
}

function addrebetClearAllButton() {

    $('.tbl_coins').find('.undoBets').remove();
    $('.tbl_coins').find('.clearAllBets').remove();
    var html = '<a href="javascript:void(0);" onclick="clearBets();" class="clearAllBets" ><img src="' + baseUrl + 'frontend/img/undo.png" data-toggle="tooltip"   title="ClearAll" data-placement="bottom"></a>';
    $('.tbl_coins').prepend(html);
}
function scrollWindow() {
    $('html, body').animate({ scrollTop: 0 }, 'slow');
}

function showWinBetDiv(type) {
    if (type == "show") {
        $(".lastStop").text("");
        $(".lastWin").text("");
        $(".bet").removeClass("hidediv");
        $(".win").removeClass("hidediv");
    } else {
        $(".lastStop").text("");
        $(".lastWin").text("");
        $(".bet").addClass("hidediv");
        $(".win").addClass("hidediv");
    }
}