$(".changeClintseed").on("click", () => {
    $(".changeClintseed").attr('disabled', true);
    if ($(".clintseed").val().length > 0 && $(".clintseed").val().length < 10) {
        $.toast({ heading: '', text: "Please enter 10 character in client seed.", position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
        $(".changeClintseed").attr('disabled', false);
        return false;
    }
    $.post(baseUrl + "update/guest/clientSheed",
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

socket.on("guestGetFairSheed", (res) => {
    // $(".serverseed").val(res.serverSheed);
    $(".clintseed").val(res.clientSheed);
});


$(document).ready(function () {
    if (userId) {
        getFairnessData();
    }
});

function getFairnessData() {
    $.get(baseUrl + "provably/guest/getsheeds", (res) => {
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
    if (localStorage.guestProvably) {
        var shownumber = JSON.parse(localStorage.guestProvably);
        var finddata = shownumber.find(x => x.roundNo == data.roundNo)
        if (!finddata) {
            socket.emit("guestCurrentSeed", { "playerId": userId, "roundNo": data.roundNo }, (res) => {
                if (res.status == "success") {
                    setDataInHtml(res.data.getProvably);
                } else {
                    $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
                }
            });
        } else {
            setDataInHtml(finddata)
        }
    } else {
        socket.emit("guestCurrentSeed", { "playerId": userId, "roundNo": data.roundNo }, (res) => {
            if (res.status == "success") {
                console.log(res);
                setDataInHtml(res.data.getProvably);
            } else {
                $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
            }
        });
    }
}
function setDataInHtml(data) {
    $("#roundnumber").val(data.roundNo);
    $("#txtserverSheed").val(data.serverSheed);
    $("#txtclientSheed").val(data.clientSheed);

    $("#txtstopNoRoulette").val(data.stopNoRoulette);

    // $("#txtrevealedServerSheed").val(data.revealedServerSheed);
    $("#txtroundStartTime").val(data.roundStartTime);

    if (data.status == "completed") {
        if (data.stopNoRoulette) {
            setNumHash(data.numericHash, data.stopNoRoulette);
        }
        $("#txtnormalServerSeed").val(data.noramlServerSeed);
        $("#txtgameHash").val(data.gameHash);
        $("#txtnounce").val(data.nounce);
    } else {
        $("#txtnumericHash").html("");
        $("#txtnormalServerSeed").val("The server seed is not discosed at this time. Only its hash the Game Hash is know");
    }
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