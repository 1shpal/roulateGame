
$("#withdraw_coin").keydown(function (e) {
    /*if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1 ||
        (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || 
        (e.keyCode >= 35 && e.keyCode <= 40)) {
             return;
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }*/
});

$(document).ready(function () {
    var maxLength = 30;
    $('#withdraw_coin').on('keydown keyup change', function () {
        var char = $(this).val();
        var charLength = $(this).val().length;
        if (charLength > maxLength) {
            $(this).val(char.substring(0, maxLength));
        }
    });
});
$(".withcoin").click(function () {
    if (userId != 0 || userId != null) {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: baseUrl + "withdraw/checkcoin",
            data: { currency_type: $(this).next(".pay-box").text().trim() },
            success: function (response) {
                if (response.status == "success") {
                    let htmlTag = `<h3 class="prox-b f-s-18">Balance:
                                <span class="user_withdraw_balance">`+ response.data.walletDetails.main_balance + `</span>
                                <img src="frontend/img/`+ response.data.currencyDetail.currency_image + `" alt="` + response.data.currencyDetail.currency_name + `" class="coinimg wcoinimg" ></h3>`;
                    $(".show_balance").html(htmlTag);
                } else {
                    $.toast({ heading: 'Error', text: response.message, position: 'top-right', icon: 'error' });
                }
            }
        });
    } else {
        $.toast({ heading: 'Error', text: 'Please Login.', position: 'top-right', icon: 'error' });
    }
});

$('.coin_withdraw_btn').click(function () {
    $(".coin_withdraw_btn").attr('disabled', true);
    $(".deposit-loding").removeClass("desplay-none");
    var coin = $('#withdraw_coin').val();
    var currencyType = $("input[name='withcoin']:checked").next(".pay-box").text().trim();
    if (currencyType != "" && currencyType != null && currencyType != undefined) {
        if (coin != "" && coin != 0) {
            if (userId != "" && userId != 0 && userId != null && userId != undefined) {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: baseUrl + "withdraw/coin",
                    data: { coin: coin, currency_type: currencyType },
                    success: function (response) {
                        $(".deposit-loding").addClass("desplay-none");
                        $(".coin_withdraw_btn").attr('disabled', false);
                        if (response.status == "success") {
                            historyTable();
                            $('.user_withdraw_balance').html(parseFloat(response.data.main_balance).toFixed(8));
                            $('.user_main_balance').text(parseFloat(response.data.main_balance).toFixed(8));
                            $(".coin" + response.data.wallet_id).text(parseFloat(response.data.main_balance).toFixed(8));
                            $.toast({ heading: 'Success', text: response.message, position: 'top-right', icon: 'success' });
                        } else {
                            if (response.status == "info") {
                                $.toast({ heading: '', text: response.message, position: 'top-right', icon: 'info', stack: false, hideAfter: 5000 });
                            } else {
                                $.toast({ heading: 'Error', text: response.message, position: 'top-right', icon: 'error' });
                            }
                        }
                    }
                })
            } else {
                $(".deposit-loding").addClass("desplay-none");
                $(".coin_withdraw_btn").attr('disabled', false);
            }
        } else {
            $(".deposit-loding").addClass("desplay-none");
            $(".coin_withdraw_btn").attr('disabled', false);
            $.toast({ heading: 'Error', text: "Please Enter Withdrawal Amount.", position: 'top-right', icon: 'error' });
        }
    } else {
        $(".deposit-loding").addClass("desplay-none");
        $(".coin_withdraw_btn").attr('disabled', false);
        $.toast({ heading: 'Error', text: "Please Select Currency Type.", position: 'top-right', icon: 'error' });
    }
});


socket.on("withdrawIPNEvent", (res) => {
    // console.log(res);
    if (res.status == "success") {
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'success' });
    } else if (res.status == "failed") {
        $('.user_withdraw_balance').html(parseFloat(res.data.main_balance).toFixed(8));
        $('.user_main_balance').text(parseFloat(res.data.main_balance).toFixed(8));
        $(".coin" + res.data.wallet_id).text(parseFloat(res.data.main_balance).toFixed(8));
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'info' });
    } else {
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error' });
    }
});