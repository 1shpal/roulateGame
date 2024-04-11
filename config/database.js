module.exports = function (dataBaseType) {
 
	try {
		var sequelize = new dataBaseType(process.env.database.dbname, process.env.database.username, process.env.database.password, {
			host: process.env.database.host,
			port: process.env.database.port,
			dialect: 'mysql',
			operatorsAliases: false,
			logging: false,
			pool: {
				max: 5,
				min: 0,
				acquire: 30000,
				//idle: 100000,	
				idle: 10000,
				//evict: 1000
			}
		});

		sequelize.authenticate().then(() => {
			console.log('Connection has been established successfully.');
		}).catch(err => {
			console.error('Unable to connect to the database:', err);
		});
		return sequelize;

	} catch (e) {
		console.log("database connection err ", e);
	}
}

//192.168.2.47
//localhost