$(".changeClintseed").on("click", () => {
    $(".changeClintseed").attr('disabled', true);
    if ($(".clintseed").val().length > 0 && $(".clintseed").val().length < 10) {
        $.toast({ heading: '', text: "Please enter 10 character in client seed.", position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
        $(".changeClintseed").attr('disabled', false);
        return false;
    }
    $.post(baseUrl + "update/clientSheed",
        { "userId": userId, "clientSheed": $(".clintseed").val() },
        (res) => {
            if (res.status == "success") {
                $(".clintseed").val(res.data.clientSheed);
                $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'success', stack: false, hideAfter: 2000 });
                if (res.data.isNew) {
                    setTimeout(() => {
                        window.location = baseUrl
                    }, 3000);
                } else {
                    removeactiveClass();
                }
            } else {
                $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
            }
            $(".changeClintseed").attr('disabled', false);
        });
});

socket.on("getFairSheed", (res) => {
    // $(".serverseed").val(res.serverSheed);
    $(".clintseed").val(res.clientSheed);
});

$(".isSelectEmailSend").on("change", function () {
    var ischecked = $(this).is(':checked');
    if (ischecked == false) {
        if (confirm("Are you sure unsubscribe provably fair round email notification!")) {
            changeEmailStatus($(this), ischecked);
            return true;
        } else {
            $(this).prop('checked', true);
            return false;
        }
    } else {
        if (confirm("Are you sure subscribe provably fair round email notification!")) {
            changeEmailStatus($(this), ischecked);
            return true;
        } else {
            $(this).prop('checked', false);
            return false;
        }
    }
});

function changeEmailStatus(e, status) {
    $.post(baseUrl + "update/emailstatus",
        { "userId": userId, "status": status },
        (res) => {
            if (res.status == "success") {
                $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'success', stack: false, hideAfter: 2000 });
            } else {
                $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
                if (status == true) {
                    e.prop('checked', false);
                } else {
                    e.prop('checked', true);
                }
            }
        });
}


$(document).ready(function () {
    if (userId) {
        getFairnessData();
    }
});

function getFairnessData() {
    $.get(baseUrl + "provably/getsheeds", (res) => {
        if (res.status == "success") {
            $(".clintseed").val(res.data.clientSheed);
        }
    });
}

$("#varifyfairTab").click(() => {
    if (userId) {
        getVarifyFairnesData({ "roundNo": "" });
    }
});
$(".findFair").click(() => {
    if (userId) {
        getVarifyFairnesData({ "roundNo": $("#roundnumber").val() });
    } else {
        $.toast({ heading: '', text: "Please login.", position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
    }
});
function getVarifyFairnesData(data) {
    $("input.proinput:text").val("");
    $.get(baseUrl + "provably/verification", data, (res) => {
        if (res.status == "success") {
            $("#roundnumber").val(res.data.game.game_number);
            $("#txtserverSheed").val(res.data.provablyFair.serverSheed);
            $("#txtclientSheed").val(res.data.provablyFair.clientSheed);

            $("#txtstopNoRoulette").val(res.data.provablyFair.stopNoRoulette);

            // $("#txtrevealedServerSheed").val(res.data.provablyFair.revealedServerSheed);
            $("#txtroundStartTime").val(res.data.provablyFair.roundStartTime);
            if (res.data.game.game_status == "completed") {
                setNumHash(res.data.provablyFair.numericHash, res.data.provablyFair.stopNoRoulette);
                $("#txtnormalServerSeed").val(res.data.provablyFair.noramlServerSeed);
                $("#txtgameHash").val(res.data.game.hashGenerated);
                $("#txtnounce").val(res.data.provablyFair.nounce);
            } else {
                $("#txtnumericHash").html("");
                $("#txtnormalServerSeed").val("The server seed is not discosed at this time. Only its hash the Game Hash is know");
            }
        } else {
            $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
        }
    });
}

function setNumHash(hash, stopno) {
    var arra = hash.match(/.{1,2}/g)
    var strhash = "";
    var isfind = false;
    for (var item = 0; item < arra.length; item++) {
        if (parseInt(arra[item]) == parseInt(stopno)) {
            if (!isfind) {
                isfind = true;
                strhash += " " + '<span class="hashstop">' + arra[item] + '</span>'
            } else {
                strhash += " " + arra[item]
            }
        } else {
            strhash += " " + arra[item]
        }
    }
    $("#txtnumericHash").html(strhash);
}

function removeactiveClass() {
    $("#varifyfairTab").removeClass("active");
    $("#verificationfairness").removeClass("active");
    $("#overviewTab").removeClass("active");
    $("#overview").removeClass("active");
    $("#clientsheedTab").removeClass("active");
    $("#changeSheedPair").removeClass("active");

    getVarifyFairnesData({ "roundNo": "" });

    $("#varifyfairTab").addClass("active");
    $("#verificationfairness").addClass("in active");
}

