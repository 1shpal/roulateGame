const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

module.exports.depositLogger = winston.createLogger({
	transports: [
		new DailyRotateFile({
			level: "info",
			filename: "log/deposit-log/depositLogger-info-%DATE%.log",
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d'
		})
	]
});

module.exports.withdrawLogger = winston.createLogger({
	transports: [
		new DailyRotateFile({
			level: "info",
			filename: "log/withdraw-log/withdrawLogger-info-%DATE%.log",
			datePattern: 'YYYY-MM-DD-HH',
			zippedArchive: true,
			maxSize: '20m',
			maxFiles: '14d'
		})
	]
});