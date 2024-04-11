

$(document).on("wheel", "#deposit_coin", function (e) {
    $(this).blur();
});

$(document).ready(function () {
    var maxLength = 30;
    $('#deposit_coin').on('keydown keyup change', function () {
        var char = $(this).val();
        var charLength = $(this).val().length;
        if (charLength > maxLength) {
            //return false;
            $(this).val(char.substring(0, maxLength));
        }
    });
});

$('.depositcoin').click(function () {
    if (userId != 0 || userId != null) {
        $.ajax({
            type: "POST",
            dataType: "json",
            url: baseUrl + "deposit/checkcoin",
            data: { coin: $(this).next(".pay-box").text().trim() },
            success: function (response) {
                if (response.status == "success") {
                    let htmlTag = `<h3 class="prox-b f-s-18">Balance:
                                <span class="user_deposite_balance">`+ response.data.walletDetails.main_balance + `</span>
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
})

$('.coin_deposit_btn').click(function () {
    $(".coin_deposit_btn").attr('disabled', true);
    $(".deposit-loding").removeClass("desplay-none");
    var amount = $('#deposit_coin').val();
    if (amount != "" && amount != 0) {
        if (userId != "" && userId != 0 && userId != null && userId != undefined) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: baseUrl + "deposit/coin",
                data: { amount: amount, currency_type: $("input[name='depositcoin']:checked").next(".pay-box").text().trim() },
                success: function (response) {
                    $(".deposit-loding").addClass("desplay-none");
                    if (response.status == "success") {
                        var htmlTag = `<img src="` + response.data.qrcode_url + `" class="coin_qr_code"><br/>
                                    <label class="coin_name_code">Your personal `+ response.currenyName + ` deposit address:                             
                                    <span class="deposit_add">`+ response.data.address + `</span>
                                    </label>`;
                        $('#qr_model').click();
                        $('.qr_code_div').html(htmlTag);
                        hidecode(response.data.timeout);
                    } else {
                        $(".coin_deposit_btn").attr('disabled', false);
                        if (response.status == "info") {
                            $.toast({ heading: '', text: response.message, position: 'top-right', icon: 'info', stack: false, hideAfter: 5000 });
                        } else {
                            $.toast({ heading: 'Error', text: response.message, position: 'top-right', icon: 'error' });
                        }
                    }
                }
            });
        } else {
            $(".deposit-loding").addClass("desplay-none");
            $(".coin_deposit_btn").attr('disabled', false);
        }
    } else {
        $(".deposit-loding").addClass("desplay-none");
        $(".coin_deposit_btn").attr('disabled', false);
        $.toast({ heading: 'Error', text: "Please Enter Deposit Amount.", position: 'top-right', icon: 'error' });
    }
});

$('#bitcoin_qr_modal').on('hidden.bs.modal', function () {
    $(".coin_deposit_btn").attr('disabled', false);
});

function hidecode(t) {
    t1 = t + 1000;
    t = parseInt(t.toString() + "00");
    // console.log("Timte Out", t);
    // console.log("t1", t1);
    setTimeout(() => {
        if ($("#bitcoin_qr_modal").data('bs.modal').isShown) {
            $('#bitcoin_qr_modal').modal('hide');
            $.toast({ heading: '', text: "QR Code Session Time Out.", position: 'top-right', icon: 'info' });
        }
        $(".coin_deposit_btn").attr('disabled', false);
    }, t);
}

socket.on("CoinPaymentIPNEvent", (res) => {
    // console.log(res);
    if (res.status == "success") {
        $('.user_deposite_balance').text(parseFloat(res.data.main_balance).toFixed(8));
        $('.user_main_balance').text(parseFloat(res.data.main_balance).toFixed(8));
        $(".coin" + res.data.wallet_id).text(parseFloat(res.data.main_balance).toFixed(8));
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'success' });
    } else if (res.status == "pending") {
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'info' });
    } else {
        $.toast({ heading: '', text: res.message, position: 'top-right', icon: 'error' });
    }
});