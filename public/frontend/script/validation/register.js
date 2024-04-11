// $.validator.addMethod("loginRegex", function(value, element) {
//   return this.optional(element) || /^[a-z0-9\\-]+$/i.test(value);
// }, "Username must contain only letters, numbers.");

$("#registerFrm").validate({
  	rules: {
    	full_name:{
        required:true        
      },
    	email_id: {
      		required: true,
      		email: true
    	},
      password: {
        required: true,
        minlength: 5,
        maxlength:30    
      },
      confirm_password: {
        required: true,
        minlength: 5,
        maxlength:30,
        equalTo: "#password"
      },
      terms_condition: "required"
  	},
    messages: {
      full_name: "Please enter your full name",
      email: {
        required: "Please enter your email address",
        email: "Please enter a valid email address",
      },
      password: {
        required: "Please enter a password",
        minlength: "Your password must be at least 5 characters long"
      },
      confirm_password: {
        required: "Please enter a password confirm",
        minlength: "Your password must be at least 5 characters long",
        equalTo: "Please enter the same password as above"
      },
      terms_condition: "Please select Tems & Condition",
    },
    submitHandler: function (form) {
        form.submit();
    }
});
$(".user_nametxt").keypress(function (e) {  
  var keyCode = e.keyCode || e.which;
  var regex = /^[A-Za-z0-9]+$/;
  var isValid = regex.test(String.fromCharCode(keyCode));
  if (!isValid) {      
      $.toast({heading: 'Error',text:"Only Alphabets and Numbers allowed.",position: 'top-right',icon: 'error',stack: false,hideAfter:2000});
  }
  return isValid;
});
$('#full_name').on('keydown keyup change', function(){
  var char = $(this).val();
  var charLength = $(this).val().length;
  if(charLength > 30){      
    $(this).val(char.substring(0, 30));
  }
});