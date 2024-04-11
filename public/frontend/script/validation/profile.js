$("#profileFrm").validate({
  	rules: {
    	pro_name: {
        required:true        
      },
    	pro_email: {
      		required: true,
      		email: true
    	}
  	},
    messages: {
      pro_name: "Please enter your name",
      email: {
        required: "Please enter your email address",
        email: "Please enter a valid email address",
      }
    },
    submitHandler: function (form) {
      form.submit();
    }
});

$('#name').on('keydown keyup change', function(){
    var char = $(this).val();
    var charLength = $(this).val().length;
    if(charLength > 30){      
      $(this).val(char.substring(0, 30));
    }
});

$('.txtaddress').on('keydown keyup change', function(){
  var char = $(this).val();
  var charLength = $(this).val().length;
  if(charLength >48){      
    $(this).val(char.substring(0, 48));
  }
});

$(".wallettAddreess").click(function(){
    let walletAddress = $(".txtaddress").val();
    var host = window.location.origin;
    var coinName = $(".game_list_menu").val();
    
    if(walletAddress !='' || walletAddress !=0){
      $.ajax({
        type: "POST",
        url: host+ '/profile/savewallet/address',
        data: { walletAddress : walletAddress,coinName:coinName },
        success: function(data) {          
           if(data.status == "200"){              
            $(".game_list_menu").val(coinName);      
            $.toast({heading: 'Success',text:data.message,position: 'top-right',icon: 'success',stack: false,hideAfter:2000});
           }else{
            $.toast({heading: 'Error',text:data.message,position: 'top-right',icon: 'error',stack: false,hideAfter:2000});
           }          
        },
      });
    }else{
      $.toast({heading: 'Error',text:"Please Enter "+currencyName(coinName)+" Withdrawal Address.",position: 'top-right',icon: 'error',stack: false,hideAfter:2000});
    }    
});
$(document).ready(function() {  
  getAllCurrencyData();
});

function currencyName(coinName){
  var Cname='';
  if(coinName == "btc"){   
    Cname='BTC';
  }else if(coinName == "eth"){					    
    Cname='ETH';
  }else if(coinName == "ltc"){					    
    Cname='LTC';
  }else if(coinName == "doge"){					    
    Cname='DOGE';
  }else if(coinName == "bch"){					    
    Cname='BCH';
  }	
  return Cname;
}

function getAllCurrencyData(){
  socket.emit("getSelectCurrencyData",userId,function(result){    
    if(result.status == "success"){
      // $('.allcurrencyBody').();            
        var walletData = result.walletData;
        var currency = result.currency;        
        var htmlTag='';
        for(let ii=0; ii<walletData.length;ii++){    
          htmlTag += '<tr class="avelebl_belens">';
          htmlTag+='<td class="avelebl_belens img_balens"><img src="'+baseUrl+'frontend/img/'+currency[ii].currency_image+'"</td>';
          htmlTag+='<td class="avelebl_belens img_btncoins">'+currency[ii].currency_name+'</td>';
          htmlTag+='<td class="blance_avile avelebl_belens">'+walletData[ii].main_balance+'</td>';
          htmlTag+='</tr>';               
        }
        $('table .allcurrencyBody').append(htmlTag);        
    }else{
      $.toast({heading: 'Error',text: result.msg ,position: 'top-right',icon: 'error',stack: false,hideAfter:2000});
    }
  });
}
