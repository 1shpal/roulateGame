module.exports = function(model){
	var module = {};

	//Start: Validation for register
	module.register = function(req, res, next){
		
		req.checkBody('full_name', 'Please enter your full name').notEmpty();
		req.checkBody('email_id', 'Please enter your email address').notEmpty();
		req.checkBody('password', 'Please enter a password').notEmpty();
		req.checkBody('confirm_password', 'Please enter a password confirm').notEmpty();
		req.checkBody('email_id', 'Please enter a valid email address').isEmail();

		var errors = req.validationErrors();
	   	if(errors){
	   		req.flash('vErrors',errors);
	      	res.redirect('/backend');
	   	}else{
	      next();
	   	}
	};
	//End: Validation for register

	//Start: Validation for login
	module.login = function(req, res, next){
		
		req.checkBody('email', 'Email Address is required').notEmpty();
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('email', 'Please enter valid email-id').isEmail();

	   	var errors = req.validationErrors();
	   	if(errors){
	   		req.flash('vErrors',errors);
	      	res.redirect('/backend');
	   	}else{
	      next();
	   	}
	};
	//End: Validation for login

	return module;	
}