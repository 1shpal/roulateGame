const { check, validationResult } = require('express-validator/check');
module.exports = function (app, model, controller) {

  var middleware = require('../app/middleware/index')(model);
  var validation = require('../app/validator/index')(model);

  app.use(async function (req, res, next) {
    var emailId = "";
    var password = "";
    if (req.session.user == undefined) {
      if (req.cookies.auth_login_detail != null && req.cookies.auth_login_detail != undefined) {
        var emailId = req.cookies.auth_login_detail.emailId;
        var password = req.cookies.auth_login_detail.password;
      }
    }

    req.session.remember = { 'emailId': emailId, 'password': password };

    if (req.session.user) {
      var userId = req.session.user.id;

      if (userId != null && userId != 0 && userId != undefined && userId != "") {
        /*model.User.findById(userId).then(userDetail=>{
            if(userDetail != null){
                if(userDetail.id == userId){
                    req.session.user = userDetail;
                    console.log("req.session.user: " , req.session.user);
                }
            }
        });*/
        next();
      } else {
        next();
      }
    } else {
      next();
    }
  });

  app.post('/register', middleware.auth.isLogin, controller.auth.register); //user register data save
  app.post('/login', middleware.auth.isLogin, controller.auth.login); //user login detail check
  app.get('/logout', controller.auth.logout); //user logout
  app.get('/forget', controller.auth.forget);
  app.post('/userlogin/forgetpassword', controller.auth.forgetPassword);
  app.get('/profile', middleware.auth.login, controller.profile.view); //profile view
  app.post('/profile/save', middleware.auth.login, controller.profile.save); //profile view save
  app.post('/profile/savewallet/address', middleware.auth.login, controller.profile.saveWalletAddress); //profile  saveWalletAddress
  app.post('/profile/image', middleware.auth.login, controller.profile.imageUpload); //profile view save    
  app.get('/profile/change/password', middleware.auth.login, controller.profile.sendPasswordLink); //change password link send
  app.get('/profile/change/password/:token', controller.profile.changePassword); //change password page view
  app.post('/profile/password/save', controller.profile.savePassword); //save new password

  app.get('/newpassword/:id', controller.auth.newPassword);
  app.post('/userlogin/updateNewpassword', controller.auth.updateNewpassword);

  // app.post('/profile/anymos', controller.profile.anymos); //save new password
  app.post('/dgCurrancy', controller.profile.dgCurrancy);
  // app.get('/', controller.home.view); //home page view
  app.get('/', controller.lighting_roulette.view);
  app.get('/lighting-roulette', middleware.auth.login, controller.lighting_roulette.view); //Lighting Roulette game view
  app.get('/history', middleware.auth.login, controller.lighting_roulette.viewHistory); //Lighting Roulette game view
  app.get('/game/history', middleware.auth.login, controller.lighting_roulette.getHisotydata);

  app.get("/game/gethistory/:id", middleware.auth.login, controller.lighting_roulette.betHistory);
  /* CMS Page View */
  app.get('/provably-fair', controller.cmsPage.provablyFair); //provably-fair view
  app.post('/provably-fair/firework', controller.cmsPage.firework); //provably-fair view
  app.post('/provably-fair/fireworkGuest', controller.cmsPage.fireworkGuest); //provably-fair view
  app.get('/provably-fair/:index', controller.cmsPage.provablyFair); //provably-fair view
  app.get('/about-us', controller.cmsPage.aboutUs); //About Us view
  app.get('/term-and-condition', controller.cmsPage.termandCondition); //Terms & Condition view
  app.get('/help', controller.cmsPage.help); //Help view
  app.get('/faq-page', controller.cmsPage.faq); //FAQ view

  app.get("/blogs/:title", controller.cmsPage.blogPages);

  app.get('/deposit', middleware.auth.login, controller.deposit.view);  //deposit view
  app.post('/deposit/checkcoin', middleware.auth.login, controller.deposit.checkcoin); //deposit coin check amount
  app.post('/deposit/coin', middleware.auth.login, controller.deposit.create);  //deposit coin add
  app.get('/deposit/getdepositelist', middleware.auth.login, controller.deposit.getTranscationList);
  app.post('/dispositeResponse', controller.deposit.depistResponce);


  app.get('/withdraw', middleware.auth.login, controller.withdraw.view);    //withdraw view
  app.post('/withdraw/checkcoin', middleware.auth.login, controller.withdraw.checkcoin);   //withdraw coin check amount
  app.post('/withdraw/coin', middleware.auth.login, controller.withdraw.create);    //withdraw coin add    
  app.get('/withdraw/getwithdrawlist', middleware.auth.login, controller.withdraw.getwithdrawlist);
  app.get('/fourcelogout', controller.auth.fourceTologout); //user logout

  app.get('/provably/getsheeds', middleware.auth.login, controller.profile.getProvablyFair);
  app.post("/update/clientSheed", middleware.auth.login, controller.profile.changeClientSheed);
  app.get("/provably/verification", middleware.auth.login, controller.profile.getFindFairData);
  app.post("/update/emailstatus", middleware.auth.login, controller.profile.emailNotificationUpdate);

  /*Guest Player */
  app.get("/login/guest", controller.auth.guestLogin);
  app.get('/guest/logout', controller.auth.logout);
  app.post("/update/guest/clientSheed", controller.profile.changeGuestClientSheed);
  app.get("/provably/guest/getsheeds", controller.profile.getGuestProvablyFair);

}