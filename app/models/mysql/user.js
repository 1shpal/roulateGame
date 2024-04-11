module.exports = function (Sequelize, Schema) {
	var User = Schema.define('user_master', {
		name: {
			type: Sequelize.STRING
		},
		email_id: {
			type: Sequelize.STRING
		},
		password: {
			type: Sequelize.STRING
		},
		main_balance: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00
		},
		total_deposite: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00
		},
		total_withdraw: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00
		},
		total_game_deposite: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00
		},
		total_win_amount: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00
		},
		clientSheed: {
			type: Sequelize.STRING,
			defaultValue: ""
		},
		btc_currency_address: {
			type: Sequelize.STRING
		},
		eth_currency_address: {
			type: Sequelize.STRING
		},
		ltc_currency_address: {
			type: Sequelize.STRING
		},
		doge_currency_address: {
			type: Sequelize.STRING
		},
		bch_currency_address: {
			type: Sequelize.STRING
		},

		profile_image: {
			type: Sequelize.STRING, defaultValue: 'default.png'
		},
		password_token: {
			type: Sequelize.STRING
		},
		forgot_password_token: {
			type: Sequelize.TEXT, defaultValue: ""
		},
		is_login: {
			type: Sequelize.ENUM('1', '0')
		},
		lastLogin: {
			type: Sequelize.DATE
		},
		socketId: {
			type: Sequelize.STRING
		},
		user_can_chat: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '1'
		},
		is_deposit: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '1'
		},
		is_withdraw: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '1'
		},
		type: {
			type: Sequelize.ENUM('admin', 'user'), defaultValue: 'user'
		},
		status: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '1'
		},
		is_deleted: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '0'
		},
		anymos: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '0'
		},
		isSelectEmailSend: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '0'
		},
		ipAddress : {
			type: Sequelize.STRING,
			defaultValue: ""
		},
		device : {
			type: Sequelize.STRING,
			defaultValue: ""
		},	
		firework :{
			type : Sequelize.STRING, defaultValue: 'firework4.gif'
		}
	}, { underscored: true });

	User.sync({ force: false, });
	// User.sync({ alter: true });


	return User;
}