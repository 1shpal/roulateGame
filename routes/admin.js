const { check, validationResult } = require('express-validator/check');
module.exports = function (app, model, controller) {

    var middleware = require('../app/middleware/index')(model);
    var validation = require('../app/validator/index')(model);


    app.get('/backend', middleware.admin.isLogin, controller.login.signin);
    app.post('/login/check', validation.admin.login, controller.login.signinCheck);
    app.get('/login/forget', middleware.admin.isLogin, controller.login.forget);
    app.post('/login/forgetpassword', middleware.admin.isLogin, controller.login.forgetPassword);

    app.get('/backend/dashboard', middleware.admin.login, controller.dashboard.view);
    app.get('/backend/logout', middleware.admin.login, controller.login.logout);
    app.get('/backend/changepassword', middleware.admin.login, controller.login.changePassword);
    app.post('/backend/changepasswordPost', validation.admin.changePassword, controller.login.changepasswordPost);

    /* Start: User routing */
    app.get('/backend/user', middleware.admin.login, controller.user.view);
    app.get('/backend/getUsers', middleware.admin.login, controller.user.getUsers);
    app.get('/backend/user/add', middleware.admin.login, controller.user.add);
    app.post('/backend/user/checkDuplicate', middleware.admin.login, controller.user.checkDuplicate);
    app.post('/backend/user/saveUser', validation.admin.user, controller.user.save);
    app.get('/backend/user/edit/:id', middleware.admin.login, controller.user.edit);
    app.post('/backend/user/updateUser/:id', validation.admin.user, controller.user.update);
    app.get('/backend/user/delete/:id', middleware.admin.login, controller.user.delete);
    /* End: User routing */

    /*Start: CMS routing*/
    app.get('/backend/cms', middleware.admin.login, controller.cms.view);
    app.get('/backend/getCms', middleware.admin.login, controller.cms.getCms);
    app.get('/backend/cms/add', middleware.admin.login, controller.cms.add);
    app.post('/backend/cms/checkDuplicate', middleware.admin.login, controller.cms.checkDuplicate);
    app.post('/backend/cms/saveCms', validation.admin.cms, controller.cms.save);
    app.get('/backend/cms/edit/:id', middleware.admin.login, controller.cms.edit);
    app.post('/backend/cms/updateCms/:id', validation.admin.cms, controller.cms.update);
    app.get('/backend/cms/delete/:id', middleware.admin.login, controller.cms.delete);
    /*End: CMS routing*/


    /*Start: Roulette routing*/
    app.get('/backend/light_roulette', middleware.admin.login, controller.light_roulette.view);
    app.get('/backend/getLightRoulette', middleware.admin.login, controller.light_roulette.getRoulette);
    app.get('/backend/roulette/detail/:id', middleware.admin.login, controller.light_roulette.detail);
    app.get('/backend/light_roulette/detail/Hisoty/:id', middleware.admin.login, controller.light_roulette.detailHisoty);
    app.get('/backend/roulette/delete/:id', middleware.admin.login, controller.light_roulette.delete);
    /*End: Roulette routing*/


    /*Start: Setting routing*/
    app.get('/backend/setting', middleware.admin.login, controller.setting.view);
    app.post('/backend/setting/update', middleware.admin.login, controller.setting.update);
    /*End: Setting routing*/

    /*Start: Banner routing*/
    app.get('/backend/banner', middleware.admin.login, controller.banner.view);
    app.post('/backend/banner/addBanner', middleware.admin.login, controller.banner.save);
    app.get('/backend/banner/details', middleware.admin.login, controller.banner.details);
    app.get('/backend/banner/detail/:id', middleware.admin.login, controller.banner.edit);
    app.get('/backend/banner/delete/:id', middleware.admin.login, controller.banner.delete);
    app.post('/backend/banner/bannerUpdte', middleware.admin.login, controller.banner.update);
    /*End: Banner routing*/

    /* Start: Deposite/withdraw routing */
    app.get('/backend/deposit', middleware.admin.login, controller.deposite.view);
    app.get('/backend/getDeposites', middleware.admin.login, controller.deposite.getDeposites);
    app.get('/backend/withdraw', middleware.admin.login, controller.withdraw.view);
    app.get('/backend/getWithdraws', middleware.admin.login, controller.withdraw.getWithdraws);
    app.get('/backend/withdraw', middleware.admin.login, controller.withdraw.view);
    /* End: Deposite/withdraw routing */
}
