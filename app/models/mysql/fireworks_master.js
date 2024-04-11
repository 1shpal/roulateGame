module.exports = function (Sequelize, Schema) {
	var Fireworks_master = Schema.define('fireworks_master', {
		
		firework_name : {
			type : Sequelize.STRING,
		},
		firework_image: {
			type : Sequelize.STRING,
		},
		isActive: {
			type : Sequelize.BOOLEAN, defaultValue : false
		},
		
	}, { underscored: true });

	Fireworks_master.sync({ force: false });

	return Fireworks_master;
}