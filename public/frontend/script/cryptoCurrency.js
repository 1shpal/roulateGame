//$('.currencyList li').click(function(){                          
$("ul.currencyList").on("click", "li", function () {
    var newText = $(this).find('.coin').text();
    var nameText = $(this).find("img").attr("alt");
    var currencyId = $(this).attr("data-id");
    var wallate_id = $(this).find('.coin').attr("data-id");
    let selectCoin = {
        user_id: userId,
        wallate_id: wallate_id,
        currencyId: currencyId
    };
    socket.emit("selectCurrency", selectCoin, function (result) {
        if (result.status == "success") {
            $(".user_main_balance").text(newText);
            $(".imgAdd").attr({ 'src': "frontend/img/" + nameText + ".svg", "alt": "" + nameText + "", "data-img": "" + currencyId + "" });
            $('.user_main_balance').attr("data-myval", wallate_id);
            $('.user_main_balance').attr("data-coinno", currencyId);
        } else {
            $.toast({ heading: 'Error', text: result.msg, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
        }
    });
});
$(document).ready(function () {
    socket.emit("getSelectCurrencyData", userId, function (result) {
        if (result.status == "success") {
            $('.currencyList li').remove();
            var walletData = result.walletData;
            var currency = result.currency;
            var htmlTag = '';
            for (let ii = 0; ii < walletData.length; ii++) {
                htmlTag += '<li class="' + currency[ii].currency_name.toString().toLowerCase() + '_currency" data-id="' + currency[ii].id + '">';
                htmlTag += '<button class="btn btn_back" type="button">';
                htmlTag += '<span><span class="coin coin' + walletData[ii].id + '" data-id="' + walletData[ii].id + '">' + walletData[ii].main_balance + '</span>';
                htmlTag += '<img src="' + baseUrl + 'frontend/img/' + currency[ii].currency_image + '" alt="' + currency[ii].currency_name.toString().toLowerCase() + '" class="styles__Img-kty25z-0 iMFZOK">';
                htmlTag += '<span class="iconName">' + currency[ii].currency_name + '</span></span>';
                htmlTag += '</button></li>';
                if (walletData[ii].is_selected == true) {
                    $(".user_main_balance").text(walletData[ii].main_balance);
                    $('.user_main_balance').attr("data-myval", walletData[ii].id);
                    $('.user_main_balance').attr("data-coinno", currency[ii].id);
                    $(".imgAdd").attr({ 'src': baseUrl + "frontend/img/" + currency[ii].currency_image, "alt": "" + currency[ii].currency_name.toString().toLowerCase() + "", "data-img": "" + currency[ii].id + "" });
                }
            }
            $(".currencyList").append(htmlTag);
        } else {
            $.toast({ heading: 'Error', text: result.msg, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
        }
    });
});
function updateBalanceOnBet(currency_name, betAmount) {
    let coinName = currency_name.toLowerCase();
    let amount = parseFloat(parseFloat($(".user_main_balance").text()) - parseFloat(betAmount)).toFixed(8);
    $("." + coinName + "_currency .coin").text(amount);
}
function updateBalance(wallate_id) {
    let data = { "wallate_id": wallate_id, "user_id": userId };

    socket.emit("getUpdateCurrencyDataId", data, function (res) {
        if (res.status == "success") {
            let coinName = res.currency.currency_name.toLowerCase();
            $("." + coinName + "_currency .coin").text(parseFloat(res.walletData.main_balance).toFixed(8));
        } else {
            $.toast({ heading: 'Error', text: res.msg, position: 'top-right', icon: 'error', stack: false, hideAfter: 2000 });
        }
    });
}
function getCurrencyName(id) {
    if (id == 1) {
        return "BTC";
    } else if (id == 2) {
        return "ETH";
    } else if (id == 3) {
        return "LTC";
    } else if (id == 4) {
        return "DOGE";
    } else if (id == 5) {
        return "BCH";
    }
    return '';
}

$(".silderBtn").on('click', function () {
    $(".navbar-collapse").collapse("hide");
});
$(".collapse_slider").on('click', function () {

    $('#body').removeClass('sidebar-open');
    $(".navbar-collapse").collapse("show");
});

$(".navbar-toggle").click(function () {
    $("body").removeClass("sidebar-open");
});
$(".mobile-chat-icon").click(function () {
    $("body").removeClass("sidebar-open");
});

$(document.body).click(function () {
    $('.collapse').collapse('hide');
});

socket.on("ForceLogout", (res) => {
    if (res.status == 'success') {
        window.location.href = window.origin + '/fourcelogout';
    }
});