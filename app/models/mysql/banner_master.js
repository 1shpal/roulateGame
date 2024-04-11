module.exports = function(Sequelize, Schema){
	var BannerMaster = Schema.define('banner_master', {
    title:{
	    type: Sequelize.STRING
	  },	 	  
	  banner_image:{
        type: Sequelize.STRING,
        allowNull: false
      },      
	  description:{
	    type: Sequelize.TEXT
	  },	
	  is_active:{
			type: Sequelize.ENUM('1', '0'),
			defaultValue: '0'
		},
		is_login_image:{
			type: Sequelize.ENUM('1', '0'),
			defaultValue: '0'
	  },	  	  
	}, {underscored: true});
	BannerMaster.sync({force: false});
	return BannerMaster;
}