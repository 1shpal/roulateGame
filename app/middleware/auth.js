module.exports = function (model) {
    var module = {};

    module.login = async function (req, res, next) {
        if (req.session.user) {
            if (req.session.user.id) {
                var userDetail = await model.User.findOne({ where: { "id": req.session.user.id } })
                if (userDetail != null) {
                    if (userDetail.id == req.session.user.id) {
                        req.session.user = userDetail;
                        if (userDetail.status == "0") {
                            req.flash('error', "Administrator blocked your account. Please contact to your administrator.");
                            return res.redirect('/');
                        }
                        if (userDetail.is_deleted == "1") {
                            delete req.session.user;
                            req.flash('error', "Administrator delete your account.");
                            return res.redirect('/');
                        }
                        next();
                    }
                } else {
                    req.flash('error', "Please login");
                    return res.redirect('/');
                }
            } else {
                req.flash('error', "Please login");
                return res.redirect('/');
            }
        } else {
            req.flash('error', "Please login");
            return res.redirect('/');
        }
    };

    module.isLogin = function (req, res, next) {
        if (req.session.user) {
            req.flash('error', "You have already login.");
            res.redirect('/');
        } else {
            next();
        }
    };

    return module;
}    