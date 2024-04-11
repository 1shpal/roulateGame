module.exports = function (Sequelize, Schema) {

	var Setting = Schema.define('setting_master', {
		roulette_commission: {
			type: Sequelize.DECIMAL(10,2),
			defaultValue: 0.00
		},
		maximumBetLimit: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00000000
		},
		sysWallet: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00000000
		},
		bonusChips: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00000000
		},
		facebook_link: {
			type: Sequelize.STRING
		},
		steam_link: {
			type: Sequelize.STRING
		},
		twitter_link: {
			type: Sequelize.STRING
		},
		landingHeaderTxt: {
			type: Sequelize.STRING,
			defaultValue: ""
		},
		landingBodyTxt: {
			type: Sequelize.STRING,
			defaultValue: ""
		},
		deposit_btc_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		deposit_eth_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		deposit_ltc_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		deposit_doge_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		deposit_bch_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		withdraw_btc_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		withdraw_eth_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		withdraw_ltc_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		withdraw_doge_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		},
		withdraw_bch_coin: {
			type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
		}
	}, { underscored: true });

	Setting.sync({ force: false });
	return Setting;
}