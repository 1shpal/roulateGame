module.exports = function (Sequelize, Schema) {

	var Cms = Schema.define('cms_master', {
		title: {
			type: Sequelize.STRING
		},
		description: {
			type: Sequelize.TEXT
		},
		meta_tag: {
			type: Sequelize.STRING
		},
		meta_title: {
			type: Sequelize.STRING
		},
		meta_description: {
			type: Sequelize.TEXT
		},
		isShowOnScreen: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '0'
		},
		is_deleted: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '0'
		}
	}, { underscored: true });

	Cms.sync({ force: false });

	return Cms;
}