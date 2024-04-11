var dateformat = require('dateformat');
var currentDate = new Date();
var Op = Sequelize.Op;

module.exports = function (model, config) {
    var module = {};

    module.view = function (request, response) {
        response.render('backend/banner/add_banner', {
            title: 'BANNER',
            error: request.flash("error"),
            success: request.flash("success"),
            vErrors: request.flash("vErrors"),
            auth: request.session,
            config: config,
            alias: 'banner',
            title: process.env.siteName
        });
    };

    module.save = async function (request, response) {
        try {
            if (request.files.banner_image) {
                if (request.body.title != null) {
                    var banner_image = request.files.banner_image;
                    var tempNum = helper.randomOnlyNumber(4);
                    var datetime = dateformat(currentDate, 'yyyymmddHHMMss');
                    var image_name = datetime + tempNum + ".jpg";
                    if(request.files.banner_image.mimetype =='image/png' || request.files.banner_image.mimetype =='image/jpg' || request.files.banner_image.mimetype =='image/jpeg' || request.files.banner_image.mimetype =='image/jpe' || request.files.banner_image.mimetype =='image/JPEG'){
                        banner_image.mv('./public/frontend/upload/banner/' + image_name, async function (uploadErr) {
                            var inputData = {
                                title: request.body.title,
                                banner_image: image_name,
                                description: request.body.description,
                                is_active: '0',
                                is_login_image:'0'
                            };
                            if (uploadErr == null) {
                                var bannerDetail = await model.BannerMaster.create(inputData).then(addres => {
                                    return addres;
                                });
                                if (bannerDetail != null) {
                                    request.flash('success', "Successfully save.");
                                    response.redirect('/backend/banner');
                                } else {
    
                                    request.flash('error', "Something wan't wrong, Please try again");
                                    response.redirect('/backend/banner');
                                }
                            } else {
                                request.flash('error', "Banner image not upload, please try again");
                                response.redirect('/backend/banner');
                            }
                        });
                    }else{
                        req.flash('error',"Image File Not Fount. Please Try Again.");
						res.redirect('/backend/banner');
                    }                    
                } else {
                    request.flash('error', "Please Enter Banner Title.");
                    response.redirect('/backend/banner');
                }
            } else {
                request.flash('error', "Banner image not found, Please try again.");
                response.redirect('/backend/banner');
            }
        } catch (error) {
            // console.log(error);
            request.flash('error', "Somthing went wrong.");
            response.redirect('/backend/banner');
        }
    };

    module.details = async function (request, response) {
        try {
            var start = parseInt(request.query.start);
            var length = parseInt(request.query.length);
            var search = request.query.search.value;
            var searchStatus='';
            var active = "Active";
            var Inactive = "Inactive";
            var statusIsactive= false;
            var statusInactive= true;
                        
            if (search != '') {
                let lentSerarchstr= search.length;
                let strfind = active.substring(0, lentSerarchstr).toString();
                
                if(search === strfind){
                    statusIsactive = true;                
                }else{
                    let strInfind = Inactive.substring(0, lentSerarchstr).toString();
                    if(search === strInfind){
                        statusInactive = false;                
                    }
                }                                                    
                if(true == statusIsactive){
                    searchStatus = '1';
                }else if(search == active){
                    searchStatus = '1';
                }else if(search == 'Inactive'){
                    searchStatus = '0';
                }else if(statusInactive == false){
                    searchStatus = '0';
                }
                query = {
                    [Op.or]: [
                        { 'title': { [Op.like]: '%' + search + '%' } },
                        { 'banner_image': { [Op.like]: '%' + search + '%' } },
                        { 'is_active':searchStatus},
                        { 'is_login_image':searchStatus},
                    ],
                };
                var banners = await model.BannerMaster.findAll({ where: query, offset: start, limit: length, raw: true });
            } else {
                var banners = await model.BannerMaster.findAll({ offset: start, limit: length, raw: true });
            }

            var bannerCount = banners.length;
            for (var i = 0; i < banners.length; i++) {
                banners[i].No = (i + 1);

                if(banners[i].is_active == 1){
                    banners[i].is_active = '<p class="text-success">Active</p>';    
                }else{
                    banners[i].is_active = '<p class="text-danger">Inactive</p>';    
                }
                if(banners[i].is_login_image == 1){
                    banners[i].is_login_image = '<p class="text-success">Active</p>';    
                }else{
                    banners[i].is_login_image = '<p class="text-danger">Inactive</p>';    
                }
                banners[i].banner_image = '<img src="' + config.baseUrl + 'frontend/upload/banner/' + banners[i].banner_image + '" class="menu-img" style="width: 10%;" alt="Banner Image" id="banner_img">';
                banners[i].editDel = '<button type="button" class="btn btn-primary btn-sm edit_banner" onclick="editBanner(' + banners[i].id + ')" title="View Banner"><i class="glyphicon glyphicon-edit"></i></button><a style="margin-left:5px;" href="/backend/banner/delete/' + banners[i].id + '" onClick="return confirm(\'Are you sure to delete?\')" class="btn btn-danger btn-sm" title="Delete banner"><i class="glyphicon glyphicon-ban-circle"></i></a>';
            }
            var obj = {
                'draw': request.query.draw,
                'recordsTotal': bannerCount,
                'recordsFiltered': bannerCount,
                'data': banners
            };
            return response.send(JSON.stringify(obj));

        } catch (error) {
            request.flash('error', "Banner detail not available.");
            response.redirect('/backend/banner');
        }
    };
    module.edit = async function (request, response) {
        var bannerId = request.params.id;
        if (bannerId != "" && bannerId != 0) {
            try {
                var bannerDetail = await model.BannerMaster.findById(bannerId);
                if (bannerDetail != null) {
                    return response.send({ status: "success", data: bannerDetail });
                } else {
                    return response.send({ status: "success", message: "Banner detail not available." });
                }
            } catch (err) {
                return response.send({ status: "success", message: "Banner detail not available." });
            }
        } else {
            return response.send({ status: "success", message: "Banner detail not available." });
        }
    };
    module.update = async function (request, response) {
        try {
            var bannerId = request.body.editid;
            // console.log("request form data : ",request.body);

            if (bannerId != "" && bannerId != 0) {                
                if (request.files.editbanner_image) {
                   // console.log(" if condition check update : ");

                    var editbanner_image = request.files.editbanner_image;
                    var tempNum = helper.randomOnlyNumber(4);
                    var datetime = dateformat(currentDate, 'yyyymmddHHMMss');
                    var re = /(?:\.([^.]+))?$/;
                    var ext = re.exec(editbanner_image.name)[1];

                    var image_name = datetime + tempNum + "."+ext;
                    
                    var bannerData = await model.BannerMaster.findById(bannerId);  
                    //console.log("bannerData: ",bannerData);                  
                    if(bannerData != null){
                        // if(request.body.editis_login_image == '1'){
                        //     var checkSingActive = await model.BannerMaster.find({where:{'is_login_image':1}});
                        //     if(checkSingActive.id == bannerId){

                        //     }
                        // }else{

                        // }                        
                        editbanner_image.mv('./public/frontend/upload/banner/' + image_name, async function (uploadErr) {
                            if (uploadErr == null) {

                                if(request.body.editis_login_image == 1)
                                {
                                    var bannerData11 = await model.BannerMaster.update({is_login_image: "0"}, { where: { 'is_login_image': 1 } }).then(data => {
                                        return data;
                                    }).catch(err => {
                                    });
                                } 
                                
                                var inputData = {
                                    title: request.body.edittitle,
                                    banner_image: image_name,
                                    description: request.body.editdescription,
                                    is_active: (request.body.editis_active) ? request.body.editis_active : "0" ,
                                    is_login_image: (request.body.editis_login_image) ? request.body.editis_login_image : "0"
                                };
                               // console.log("inputData if condition : ",inputData);

                                var update_data = await bannerData.update(inputData);
                               // console.log("update details if condition : ",update_data);

                                request.flash('success', "Banner detail update successfully.");
                                response.redirect('/backend/banner');
                            } else {
                                request.flash('error', "Banner image not upload, please try again");
                                response.redirect('/backend/banner');
                            }
                        });                       
                    }else{
                        request.flash('error', "Banner detail not update.");
                        response.redirect('/backend/banner');
                    }                    
                } else {
                   
                  //  console.log("request.body.editis_login_image :",request.body.editis_login_image);
                    if(request.body.editis_login_image==1)
                    {
                        var bannerData = await model.BannerMaster.update({is_login_image: "0"}, { where: { 'is_login_image': 1 } }).then(data => {
                            return data;
                        }).catch(err => {
                        });
                    }
                     

                    var inputData = {
                        title: request.body.edittitle,
                        description: request.body.editdescription,
                        is_active: (request.body.editis_active) ? request.body.editis_active : "0" ,
                        is_login_image: (request.body.editis_login_image) ? request.body.editis_login_image : "0"
                            
                    };                    
                    var bannerData = await model.BannerMaster.update(inputData, { where: { 'id': bannerId } }).then(data => {
                        return data;
                    }).catch(err => {
                    });

                    // var count =  await model.BannerMaster.count({where:{'is_login_image':1}});

                    // console.log("count array : ",count);

                    request.flash('success', "Banner detail update successfully.");
                    response.redirect('/backend/banner');
                }

            } else {
                return response.send({ status: "success", message: "Banner detail not available." });
            }
        } catch (error) {
            request.flash('error', "Banner detail not available.");
            response.redirect('/backend/banner');
        }
    };
    module.delete = async function (request, response) {
        try {
            var bannerId = request.params.id;
            if (bannerId != "" && bannerId != 0) {
                var gameData = await model.BannerMaster.destroy({ where: { id: bannerId } });
                request.flash('success', "Banner deleted successfully.");
                response.redirect('/backend/banner');
            } else {
                request.flash('error', "Banner detail not fouind.");
                response.redirect('/backend/banner');
            }
        } catch (error) {
            request.flash('error', "Banner detail not available.");
            response.redirect('/backend/banner');
        }
    };

    return module;
}
