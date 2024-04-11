const Op = Sequelize.Op;
const { mode } = require('crypto-js');
var dateformat = require('dateformat');
var seconds = 30;

var oddsNumber = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36'];

var d1 = ["3", "6", "9", "12", "15", "18", "21", "24", "27", "30", "33", "36"];
var d2 = ["2", "5", "8", "11", "14", "17", "20", "23", "26", "29", "32", "35"];
var d3 = ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28", "31", "34"];

var c4 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
var c5 = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
var c6 = ["25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"];

var f18 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"];
var even = ["2", "4", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36"];
var red = ["1", "3", "5", "7", "9", "12", "14", "16", "18", "19", "21", "23", "25", "27", "30", "32", "34", "36"];

var black = ["2", "4", "6", "8", "10", "11", "13", "15", "17", "20", "22", "24", "26", "28", "29", "31", "33", "35"];
var odd = ["1", "3", "5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "25", "27", "29", "31"];
var s18 = ["19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"];

var sloat = [[], d1, d2, d3, c4, c5, c6, f18, even, red, black, odd, s18];

module.exports = function (model, config) {
	var module = {};
	var gameStartCount = config.lightRouletteStartTime;
	var betColor = [];
	betColor['red'] = 2;
	betColor['black'] = 2;
	betColor['green'] = 3;

	var getRandomNumber = async function () {
		return Math.floor(Math.random() * (36 - 1 + 1) + 1);
	};

	module.getBetHistory = async function(socket, data, cb){
		try{
			var userBetData = await model.LightingRoulette.findAll({ limit : 5, where : { playerId : data.userId , game_status : 'completed' }, order :[['created_at','DESC']], raw : true })	
			// console.log('userBetData -->', userBetData);
			if(!userBetData.length){
				return cb({ "status": "error", "message": "User bet data not found" });
			}
			var userDataObj = [];
			for(i = 0; i < userBetData.length; i++ ){
				userDataObj.push(userBetData[i].stopped_on_number)
			}
			return cb ({
				'status': 'success',
				'message': '',
				'data' : {
					'betStopeNumber' : userDataObj,
				}
			})

		}catch(error){
			console.log("getBetHistory in error ....", error);
			return cb({ "status": "error", "message": "Something went wrong." });
		}
	}

	module.getPlayerGame = async function (socket, data, cb) {
		try {
			if (!data.playerId) {
				return cb({ "status": "error", "message": "Please login." });
			}
			var playerDetail = await model.User.findOne({ where: { "id": data.playerId } });
			if (!playerDetail) {
				return cb({ "status": "error", "message": "Player detail not found." });
			}
			if (playerDetail.status == "0") {
				return cb({ "status": "error", "message": "You have block to play a game. Please contect to your administrator." });
			}

			socket.user = {};

			data.playerId = playerDetail.id;
			socket.user.playerId = playerDetail.id;
			socket.user.name = playerDetail.name;

			var lastStopNo = await model.LightingRoulette.findOne({
				where: { "playerId": data.playerId, "game_status": "completed" },
				order: [['id', 'DESC']],
				attributes: ["playerId", "stopped_on_number"],
				raw: true
			});

			var lastWinStopNo = await model.LightingRoulette.findOne({
				where: { "playerId": data.playerId, "game_status": "completed", "winning_amount": { [Op.gt]: 0 } },
				order: [['id', 'DESC']],
				attributes: ["playerId", "stopped_on_number"],
				raw: true
			});

			var totalWinGame = await model.LightingRouletteHistory.findAll({
				where: { "user_id": data.playerId, "is_won": "yes" },
				"group": ["game_id"],
				raw: true
			});
			totalWinGame = (totalWinGame.length > 0) ? totalWinGame.length : "0";
			var gameMaster = await model.LightingRoulette.findOne({
				where: { "playerId": data.playerId, "game_status": { [Op.ne]: "completed" } },
				order: [['id', 'DESC']]
			});
			if (gameMaster) {
				let getHistory = await model.LightingRouletteHistory.findAll({
					where: { "user_id": data.playerId, "game_id": gameMaster.id }
				});
				if (gameMaster.game_status == "started") {
					if (!gameMaster.stopped_on_number || gameMaster.stopped_on_number < 0) {
						gameMaster.stopped_on_number = await getRandomNumber();
						await gameMaster.update({ "stopped_on_number": gameMaster.stopped_on_number });
					}
				}
				RouletteMaster["plr" + data.playerId] = gameMaster;

				socket.join("plr" + data.playerId);

				io.to("plr" + data.playerId).emit("currentGame", gameMaster);

				return cb({
					"status": "success",
					"message": "",
					"data": {
						"playerId": data.playerId,
						"totalWinCnt": totalWinGame,
						"game": gameMaster,
						"history": getHistory,
						"previewGame": {
							"lastStopNo": (lastStopNo) ? lastStopNo.stopped_on_number : "",
							"lastWinStopNo": (lastWinStopNo) ? lastWinStopNo.stopped_on_number : ""
						}
					}
				});
			} else {
				var getLastgame = await model.LightingRoulette.findOne({ where: { "playerId": data.playerId, "game_status": "completed" }, limit: 1, order: [['id', 'DESC']] });
				var gameNo = 1;
				if (getLastgame) {
					gameNo = gameNo + parseInt(getLastgame.game_number);
				}

				let getProvably = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": data.playerId } });
				let clsSheed = playerDetail.clientSheed;
				if (playerDetail.clientSheed == "0" || !playerDetail.clientSheed) {
					clsSheed = await helper.getClientSheed();
				}

				if (!getProvably) {
					/* Provably Fair Updates */
					let getRoundNo = await model.ProvablyFair.findOne({ where: { "status": "completed", "userId": data.playerId }, order: [['id', 'DESC']] });
					let serverSheed = await helper.getServerSheed();
					let provably = {
						"roundStartTime": moment().format("hh:mm:ss"),
						"roundNo": (getRoundNo) ? parseInt(getRoundNo.roundNo) + 1 : 1,
						"noramlServerSeed": serverSheed,
						"serverSheed": await helper.SHA256(serverSheed),
						"clientSheed": clsSheed,
						"clientSheedUpdateTime": (getRoundNo) ? getRoundNo.clientSheedUpdateTime : new Date(),
						"userId": data.playerId
					}
					getProvably = await model.ProvablyFair.create(provably);

					await playerDetail.update({ "clientSheed": provably.clientSheed });

					io.to("plr" + data.playerId).emit("getFairSheed",
						{
							"serverSheed": provably.serverSheed,
							"revealedServerSheed": "",
							"clientSheed": provably.clientSheed
						});
				}

				var gameData = {
					game_number: gameNo,
					game_hash: getProvably.serverSheed,
					bet_amount: 0.00,
					admin_commission: parseInt(SettingMaster.roulette_commission),
					winner_amount: 0.00,
					playerId: data.playerId
				};
				let newgame = await model.LightingRoulette.create(gameData);
				if (!newgame) {
					return cb({ "status": "error", "message": "Something went wrong. Game detail not found." });
				}

				RouletteMaster['plr' + data.playerId] = newgame;

				socket.join("plr" + data.playerId);

				io.to("plr" + data.playerId).emit("currentGame", newgame);

				if (playerDetail.isSelectEmailSend == "1") {
					let notifyData = {
						userId: playerDetail.id,
						userName: playerDetail.name,
						notificationType: "newround",
						email: playerDetail.email_id,
						roundNo: gameData.game_number,
						gameHash: gameData.game_hash,
						roundStartTime: getProvably.roundStartTime,
						serverSeed: "The server  seed is not discosed at this time. Only its hash the  Game Hash is know"
					}

					let sendNotification = await sendEmailToPlayer(notifyData);
					io.to("plr" + playerDetail.id).emit("getEmailNotification", sendNotification);
				}

				return cb({
					"status": "success",
					"message": "",
					"data": {
						"playerId": data.playerId,
						"totalWinCnt": totalWinGame,
						"game": newgame,
						"history": [],
						"previewGame": {
							"lastStopNo": (lastStopNo) ? lastStopNo : "",
							"lastWinStopNo": (lastWinStopNo) ? lastWinStopNo : ""
						}
					}
				});	
			}
		} catch (error) {
			console.log("......................", error);
			return cb({ "status": "error", "message": "Something went wrong." });
		}
	};
	module.placeBet = async function (socket, data, callback) {
		try {
			// console.log('data -->', data.placeBetObj.playerSelectBet);	
			if (!data) {
				return callback({ 'status': 'error', 'message': 'Place bet detail not found.' });
			}
			if (!data.walletId) {
				return callback({ 'status': 'error', 'message': 'Please select currency for place bet.' });
			}
			let userId = data.playerId;
			let userDetail = await model.User.findOne({ where: { "id": userId } });
			// console.log('userDetail -->', userDetail);

			if (!userDetail) {
				return callback({ 'status': 'error', 'message': 'Player detail not found.' });
			}
			if (userDetail.status != "1") {
				return callback({ 'status': 'error', 'message': 'You have block to place bet. Please contact to your administrator.' });
			}

			let isValid = await checkBetAmount(data.placeBetObj);
			if (isValid.status != "success") {
				return callback(isValid);
			}
			if (data.placeBetObj.totalBetAmount <= 0) {
				return callback({ 'status': 'error', 'message': 'Please enter bet amount.' });
			}
			if (!userDetail.clientSheed || userDetail.clientSheed == null) {
				return callback({ 'status': 'alert', 'message': 'Please update your client seed.' });
			}

			let game = RouletteMaster['plr' + userId];
			// console.log('game -->', game.id);

			if (!game) {
				game = await getPlayerGameData(data);
			}
			// console.log('game -->', game);

			let isJoin = await model.LightingRouletteHistory.count({ where: { 'game_id': game.id, 'user_id': userId } });
			// console.log('isJoin-- >',isJoin);

			if (isJoin > 0) {
				return callback({ 'status': 'error', 'message': 'You have already placed your bet.' });
			}

			var playerWalletes = await model.UserWalletMaster.findOne({ where: { 'user_id': userDetail.id, 'is_selected': true } });
			// console.log('playerWalletes -->', playerWalletes);

			if (!playerWalletes) {
				return callback({ 'status': 'error', 'message': 'User wallet detail not found.' });
			}

			if (playerWalletes.id != data.walletId) {
				await userDetail.update({ "status": "0" });
				return callback({ status: "info", message: "Administrator has blocked your account. Because of your illegal activity. Please content to your administrator" });
			}
			let currencyDetail = CurrencyMaster.find((i) => i.id == playerWalletes.currency_id);
			if (!currencyDetail) {
				currencyDetail = await model.CurrencyMaster.findOne({ where: { "id": playerWalletes.currency_id } });
			}
			// console.log('currencyDetail -->', currencyDetail);

			let chipsBetAmout = parseFloat(data.placeBetObj.totalBetAmount) / currencyDetail.chipsAmount
			// console.log('chipsBetAmout -->', chipsBetAmout);

			if (parseFloat(playerWalletes.main_balance) < parseFloat(chipsBetAmout)) {
				return callback({ 'status': 'error', 'message': 'Insufficient chips in your wallet.' });
			}

			// console.log('data.placeBetObj.playerSelectBet -->', data.placeBetObj.playerSelectBet);
			var historyAddRes = await model.LightingRouletteHistory.bulkCreate(data.placeBetObj.playerSelectBet);
			// console.log('historyAddRes -->'), historyAddRes;

			if (!historyAddRes) {
				return callback({ 'status': 'error', 'message': 'Failed your place bet. Please try again.' });
			}
			// console.log('upppppppp');	
			var uptLightingRoulette = await model.LightingRoulette.update({
				"bet_amount": parseFloat(data.placeBetObj.totalBetAmount),
				"totalChipsBet": parseFloat(data.placeBetObj.totalChipsBetAmount),
				"currencyId": currencyDetail.id,
				"currencyRate": currencyDetail.chipsAmount,
				"isTurbo": (data.isTurbo == true || data.isTurbo == "true") ? "1" : "0"
			}, { where: { "id": game.id } });
			// console.log('uptLightingRoulette -->', uptLightingRoulette);	


			var uptProvablyFair = await model.ProvablyFair.update({
				"nounce": (data.currenttime) ? data.currenttime : moment().format("hh:mm:ss")
			}, { where: { "status": "active", "userId": userId } });
			// console.log('uptProvablyFair -->', uptProvablyFair);

			game.bet_amount = parseFloat(data.placeBetObj.totalBetAmount)
			game.totalChipsBet = parseFloat(data.placeBetObj.totalChipsBetAmount)
			game.isTurbo = (data.isTurbo == true || data.isTurbo == "true") ? "1" : "0"

			let updateBalance = parseFloat(playerWalletes.main_balance) - parseFloat(chipsBetAmout);
			let totalDeposit = parseFloat(playerWalletes.total_game_deposite) + parseFloat(chipsBetAmout);
			let walletDetail = {
				wallet_id: playerWalletes.id,
				currency_id: playerWalletes.currency_id,
				main_balance: updateBalance
			}
			var uptLightingRouletteHistory = await model.LightingRouletteHistory.update({ "wallete_id": playerWalletes.id }, { where: { "user_id": userId, "game_id": game.id } });
			// console.log('uptLightingRouletteHistory -->', uptLightingRouletteHistory);
			var uptplayerWalletes = await playerWalletes.update({ "main_balance": updateBalance, "total_game_deposite": totalDeposit });
			// console.log('uptplayerWalletes --->',uptplayerWalletes);

			return callback({
				"status": "success",
				"message": "Successfully placed bet",
				"data": {
					"userDetail": userDetail,
					"walletDetail": walletDetail
				}
			});

		} catch (error) {
			console.log("error----> ", error);
			return callback({ "status": "fail", 'message': "Something want wrong." });
		}
	};

	async function checkBetAmount(data) {	
		if (!data) {
			return { "status": "error", "message": "Please enter your bet." }
		}
		if (data.totalChipsBetAmount <= 0) {
			return { "status": "error", "message": "Please enter your bet greater than zero." }
		}
		let totalWinAmount = 0;
		if (data.playerSelectBet.length > 0) {
			for (let bet of data.playerSelectBet) {
				if (bet.chipsBetAmount <= 0) {
					return { "status": "error", "message": "Please enter your bet greater than zero." }
					break;
				}
				let tempWin = await winAmountLogic(bet.bet_amount, bet.isSector, bet.sectorNo);
				totalWinAmount = totalWinAmount + tempWin.net_winning_amout;
			}
		}

		if (parseFloat(totalWinAmount) > parseFloat(SettingMaster.maximumBetLimit)) {
			return { "status": "info", "message": "You are beyond bet limit" }
		}
		return { "status": "success", "message": "" }
	}

	module.gameRebeat = async function (socket, data, callback) {
		try {
			if (!data.playerId) {
				return callback({ 'status': 'error', 'message': 'Please login.' });
			}
			let userId = data.playerId;
			let gameDetail = await model.LightingRoulette.findOne({ where: { game_status: 'completed' }, limit: 1, order: [['id', 'DESC']] });
			if (gameDetail) {
				let history = await model.LightingRouletteHistory.findAll({ where: { user_id: userId, game_id: gameDetail.id }, order: [['game_id', 'DESC']] });
				// console.log(history);
				let data = {
					"status": "success",
					"game": gameDetail,
					"history": history
				};
				return callback({ "status": "success", "message": "", "data": data });
			} else {
				return callback({ "status": "info", "message": "Game detail not found.", "data": {} });
			}
		} catch (error) {
			return callback({ "status": "error", "message": "Something went wrong." });
		}
	};
	//Start lighting Roulette page refresh
	module.lightgameRestart = async function (userId, callback) {
		try {
			var gameDetail = await model.LightingRoulette.findOne({ where: { [Op.or]: [{ 'game_status': 'pending' }, { 'game_status': 'started' }] }, limit: 1, order: [['id', 'DESC']] });
			var currentGameDetails = await model.LightingRouletteHistory.findAll({ where: { user_id: userId, game_id: gameDetail.id }, order: [['game_id', 'DESC']] });

			let stopTime = new Date(gameDetail.game_complete_date);
			let datetime = new Date();
			let gameTimer = parseInt((stopTime) - (datetime));
			//console.log("game end time", gameTimer);
			let data = {
				status: 'success',
				gameDetail: gameDetail,
				currentGameDetails: currentGameDetails,
				gameTimer: gameTimer
			};
			callback(data);
			//console.log("user id", userId);
		} catch (error) {
			console.log(error);
		}
	};
	//End lighting Roulette page refresh

	//-----  Start Game Logic ------//
	module.getRouletteStopNumber = async function (socket, data, callback) {
		if (!data.playerId) {
			return callback({ 'status': 'error', 'message': 'Please login.' });
		}
		let userId = data.playerId;

		let game = RouletteMaster["plr" + userId];
		if (!game) {
			game = await getPlayerGameData({ "playerId": userId });
		}

		let isJoin = await model.LightingRouletteHistory.count({ where: { 'game_id': game.id, 'user_id': userId } });
		if (isJoin <= 0) {
			return callback({ 'status': 'error', 'message': 'You have not place bet.' });
		}

		let getProvably = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": userId } });
		if (!getProvably) {
			// getProvably = await model.ProvablyFair.create({ "preHash": await helper.getNumber(40), "gameId": game.id, "isUsed": "1" })
		}
		let nounce = getProvably.nounce;
		let gameHash = await helper.SHA512(getProvably.noramlServerSeed + getProvably.clientSheed + nounce);

		let getHaxData = await helper.getProvablyStopNo(gameHash);
		await getProvably.update({
			"spinTime": nounce,
			"gameHash": gameHash,
			"numericHash": getHaxData.decimalHash,
			"stopNoTime": getHaxData.stopNumber,
			"gameId": game.id
		});

		await model.LightingRoulette.update({
			"stopped_on_number": (getHaxData.stopNumber).toString(),
			"hashGenerated": gameHash,
			"game_status": "started"
		}, { where: { "id": game.id } });

		game.hashGenerated = gameHash;
		game.stopped_on_number = (getHaxData.stopNumber).toString();

		let rouletSpinTimer = (game.isTurbo == "1") ? 50 : 15000
		return callback({
			"status": "success",
			"message": "Spin",
			"data": { "stopped_on_number": (getHaxData.stopNumber).toString(), rouletSpinTimer: rouletSpinTimer }
		});
	};

	module.gameWinningLogic = async function (socket, data, callback) {

		let stopWheelTime = moment().format("hh:mm:ss");

		if (!data.playerId) {
			return callback({ 'status': 'error', 'message': 'Please login.' });
		}

		let userId = data.playerId;
		let game = RouletteMaster["plr" + userId];
		console.log('game -->', game);
		if (!game) {
			game = await getPlayerGameData({ "playerId": userId });
		}
		if (game.game_status == "completed") {
			return callback({ 'status': 'error', 'message': '' });
		}
		game.game_status = "completed";

		let gameHistory = await model.LightingRouletteHistory.findAll({ where: { "user_id": userId, "game_id": game.id, "is_won": "pending" } });
		let noInGroup = [];
		let groupAr = [];

		for (let g = 1; g < sloat.length; g++) {
			if (sloat[g].includes(game.stopped_on_number)) {
				noInGroup.push(g);
			}
		}
		var gameWinners = [];
		var gameLosers = [];
		var totalWin = 0;
		var totalLost = 0;
		var walletId = "";
		let totalNetWin = 0;
		for (let plr = 0; plr < gameHistory.length; plr++) {

			walletId = gameHistory[plr].wallete_id;

			if (gameHistory[plr].isSector == "0") {
				if (gameHistory[plr].selectedNumber == game.stopped_on_number) {
					gameHistory[plr].is_won = "yes";
					let winRes = await winAmountLogic(gameHistory[plr].chipsBetAmount,
						gameHistory[plr].isSector,
						gameHistory[plr].sectorNo);
					gameHistory[plr].net_winning_amout = winRes.net_winning_amout;
					gameHistory[plr].winning_amount = winRes.winAmount;
					let winner = {
						id: gameHistory[plr].id,
						chipsNumber: gameHistory[plr].chipsNumber,
						bet_amount: gameHistory[plr].bet_amount,
						chipsBetAmount: gameHistory[plr].chipsBetAmount,
						selected_color: gameHistory[plr].selected_color,
						selectedNumber: gameHistory[plr].selectedNumber,
						winning_amount: gameHistory[plr].winning_amount,
						is_won: gameHistory[plr].is_won,
						isSector: gameHistory[plr].isSector,
						sectorNo: gameHistory[plr].sectorNo,
						user_id: gameHistory[plr].user_id,
						game_id: gameHistory[plr].game_id,
						wallete_id: gameHistory[plr].wallete_id
					}
					gameWinners.push(winner);

					await gameHistory[plr].update({
						"winning_amount": winRes.winAmount,
						"net_winning_amout": winRes.net_winning_amout,
						"is_won": "yes"
					});

					// await model.UserWalletMaster.increment({ "main_balance": winRes.winAmount }, {
					// 	where: {
					// 		"user_id": userId,
					// 		"id": gameHistory[plr].wallete_id
					// 	}
					// });
					totalWin += parseFloat(winRes.winAmount);
					totalNetWin += parseFloat(winRes.net_winning_amout)

				} else {
					totalLost += parseFloat(gameHistory[plr].chipsBetAmount)
					gameHistory[plr].is_won = "no";
					gameLosers.push(gameHistory[plr]);
				}
			} else {
				if (noInGroup.includes(gameHistory[plr].sectorNo)) {
					gameHistory[plr].is_won = "yes";
					let winRes = await winAmountLogic(gameHistory[plr].chipsBetAmount,
						gameHistory[plr].isSector,
						gameHistory[plr].sectorNo);
					gameHistory[plr].net_winning_amout = winRes.net_winning_amout;
					gameHistory[plr].winning_amount = winRes.winAmount;

					// console.log("winReswinRes", winRes);
					let winner = {
						id: gameHistory[plr].id,
						chipsNumber: gameHistory[plr].chipsNumber,
						bet_amount: gameHistory[plr].bet_amount,
						chipsBetAmount: gameHistory[plr].chipsBetAmount,
						selected_color: gameHistory[plr].selected_color,
						selectedNumber: gameHistory[plr].selectedNumber,
						winning_amount: gameHistory[plr].winning_amount,
						is_won: gameHistory[plr].is_won,
						isSector: gameHistory[plr].isSector,
						sectorNo: gameHistory[plr].sectorNo,
						user_id: gameHistory[plr].user_id,
						game_id: gameHistory[plr].game_id,
						wallete_id: gameHistory[plr].wallete_id
					}
					gameWinners.push(winner);
					await gameHistory[plr].update({
						"winning_amount": winRes.winAmount,
						"net_winning_amout": winRes.net_winning_amout,
						"is_won": "yes"
					});
					// await model.UserWalletMaster.increment({ "main_balance": winRes.winAmount }, {
					// 	where: {
					// 		"user_id": userId,
					// 		"id": gameHistory[plr].wallete_id
					// 	}
					// }); 
					totalWin += parseFloat(winRes.winAmount);
					totalNetWin += parseFloat(winRes.net_winning_amout)
				} else {
					totalLost += parseFloat(gameHistory[plr].chipsBetAmount)
					gameHistory[plr].is_won = "no";
					gameLosers.push(gameHistory[plr]);
				}
			}
		}

		await model.LightingRouletteHistory.update({
			"is_won": "no"
		}, { where: { "user_id": userId, "game_id": game.id, "is_won": "pending" } });

		// console.log("totalWintotalWintotalWin", totalWin);
		// console.log("totalLosttotalLosttotalLost", totalLost);		
		let admin_commission = 0;

		let totalWinAmoutShow = totalWin;

		game.winning_amount = totalWin;
		game.game_status = "completed";
		game.game_hash = "";


		delete RouletteMaster["plr" + userId];

		var walleteDetail = "";
		let isWin = false;
		var totalWinAmoutinChisp = 0;
		var netTotalGain = 0;
		if (gameWinners.length > 0) {
			isWin = true;
			admin_commission = parseFloat(parseInt(game.admin_commission) * parseFloat(totalWin)) / 100;
			totalWin = totalWin - admin_commission;
			await model.Setting.decrement({ "sysWallet": parseFloat(totalWin).toFixed(8) }, { where: { "id": SettingMaster.id } });
			await model.Setting.increment({ "total_admin_commisstion": parseFloat(admin_commission).toFixed(8) }, { where: { "id": SettingMaster.id } });

			netTotalGain = totalWin - parseFloat(game.bet_amount);

			walleteDetail = await model.UserWalletMaster.findOne({
				where: { "user_id": userId, "id": walletId },
				attributes: ["id", "main_balance", "currency_id"],
				raw: true
			});
			let totalmain_balance = parseFloat(walleteDetail.main_balance) + parseFloat(totalWin);
			await model.UserWalletMaster.update({ "main_balance": totalmain_balance }, { where: { "id": walleteDetail.id } });

			walleteDetail.main_balance = parseFloat(parseFloat(walleteDetail.main_balance) + parseFloat(totalWin)).toFixed(8)

			let currencyDetail = CurrencyMaster.find((i) => i.id == walleteDetail.currency_id);
			if (!currencyDetail) {
				currencyDetail = await model.CurrencyMaster.findOne({ where: { "id": walleteDetail.currency_id } });
			}

			totalWinAmoutinChisp = parseFloat(totalWinAmoutShow) * currencyDetail.chipsAmount
		}
		let getProvably = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": userId } });

		await model.ProvablyFair.update({
			"wheelStopTime": stopWheelTime,
			"revealedServerSheed": getProvably.serverSheed,
			"stopNoRoulette": game.stopped_on_number,
			"status": "completed"
		}, { where: { "status": "active", "userId": userId, "gameId": game.id } });
		await model.LightingRoulette.update({
			"totalWinAmountShow": totalWinAmoutinChisp,
			"winning_amount": totalWinAmoutShow,
			"game_status": "completed",
			"game_hash_createDate": new Date(),
			"admin_commission_price": parseFloat(admin_commission)
		}, {
			where: { "id": game.id }
		});

		let playerDetail = await model.User.findOne({ where: { "id": userId } });

		if (playerDetail.isSelectEmailSend == "1") {
			let notifyData = {
				userId: playerDetail.id,
				userName: playerDetail.name,
				notificationType: "completed",
				email: playerDetail.email_id,
				roundNo: game.game_number,
				gameHash: getProvably.serverSheed,
				roundStartTime: getProvably.roundStartTime,
				serverSeed: getProvably.noramlServerSeed,
				clientSeed: getProvably.clientSheed,
				nounce: getProvably.nounce,
				hashGameSHA512: game.hashGenerated,
				numericHash: getProvably.numericHash,
				stopNo: game.stopped_on_number
			}

			let sendNotification = await sendEmailToPlayer(notifyData);
			io.to("plr" + playerDetail.id).emit("getEmailNotification", sendNotification);
		}
		return callback({
			"status": "success",
			"message": "Game completed successfully.",
			"data": {
				"playerId": userId,
				"isWin": isWin,
				"game": game,
				"gameWinners": gameWinners,
				"gameLosers": gameLosers,
				"totalWinAmoutShow": parseFloat(totalWinAmoutinChisp).toFixed(2),
				"totalNetWin": totalNetWin,
				"totalWin": totalWin,
				"walleteDetail": walleteDetail,
				"netTotalGain": netTotalGain
			}
		});
	};
	
	module.createNewGame = async function (socket, data, cb) {
		if (!data.playerId) {
			return cb({ 'status': 'error', 'message': 'Player id not found.' });
		}

		var isPending = await model.LightingRoulette.findOne({ where: { "playerId": data.playerId, "game_status": { [Op.ne]: "completed" } } });
		if (isPending) {
			RouletteMaster['plr' + data.playerId] = isPending;
		} else {
			var getLastgame = await model.LightingRoulette.findOne({ where: { "playerId": data.playerId, "game_status": "completed" }, limit: 1, order: [['id', 'DESC']] });
			var gameNo = 1;
			if (getLastgame) {
				gameNo = gameNo + parseInt(getLastgame.game_number);
			}

			let playerDetail = await model.User.findOne({ where: { "id": data.playerId } });

			let serverSheed = await helper.getServerSheed();
			let getProvably = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": data.playerId } });
			if (!getProvably) {
				/* Provably Fair Updates */

				let clientseed = playerDetail.clientSheed;
				if (!playerDetail.clientSheed || playerDetail.clientSheed == "0") {
					clientseed = await helper.getClientSheed();
				}
				let getRoundNo = await model.ProvablyFair.findOne({ where: { "status": "completed", "userId": data.playerId }, order: [['id', 'DESC']] });

				let provably = {
					"roundStartTime": moment().format("hh:mm:ss"),
					"roundNo": (getRoundNo) ? parseInt(getRoundNo.roundNo) + 1 : 1,
					"noramlServerSeed": serverSheed,
					"serverSheed": await helper.SHA256(serverSheed),
					"clientSheed": clientseed,
					"clientSheedUpdateTime": (getRoundNo) ? getRoundNo.clientSheedUpdateTime : new Date(),
					"userId": data.playerId
				}
				getProvably = await model.ProvablyFair.create(provably);
				await playerDetail.update({ "clientSheed": provably.clientSheed });

				io.to("plr" + data.playerId).emit("getFairSheed",
					{
						"serverSheed": provably.serverSheed,
						"revealedServerSheed": "",
						"clientSheed": provably.clientSheed
					});
			}

			var gameData = {
				game_number: gameNo,
				game_hash: getProvably.serverSheed,
				bet_amount: 0.00,
				admin_commission: parseInt(SettingMaster.roulette_commission),
				winner_amount: 0.00,
				playerId: data.playerId
			};
			let newgame = await model.LightingRoulette.create(gameData);
			if (!newgame) {
				return cb({ "status": "error", "message": "Something went wrong. Game detail not found." });
			}

			RouletteMaster['plr' + data.playerId] = newgame;

			if (playerDetail.isSelectEmailSend == "1") {
				let notifyData = {
					userId: playerDetail.id,
					userName: playerDetail.name,
					notificationType: "newround",
					email: playerDetail.email_id,
					roundNo: gameData.game_number,
					gameHash: gameData.game_hash,
					roundStartTime: getProvably.roundStartTime,
					serverSeed: "The server  seed is not discosed at this time. Only its hash the  Game Hash is know"
				}

				let sendNotification = await sendEmailToPlayer(notifyData);
				io.to("plr" + playerDetail.id).emit("getEmailNotification", sendNotification);
			}
		}

		var lastTwoGame = await model.LightingRoulette.findAll({
			where: { "playerId": data.playerId, "game_status": "completed" },
			attributes: ["playerId", "stopped_on_number"],
			raw: true
		});

		let res = {
			"status": "success",
			"message": "",
			"data": {
				"game": RouletteMaster['plr' + data.playerId],
				"history": [],
				"previewGame": lastTwoGame
			}
		};
		io.to("plr" + data.playerId).emit("currentGame", RouletteMaster['plr' + data.playerId]);
		return cb(res);
	}
	//----- End Game Logic --------//

	module.gameDetail = async function (socket, data, cb) {
		if (!data.playerId) {
			return callback({ 'status': 'error', 'message': 'Player id not found.' });
		}
		let game = RouletteMaster["plr" + userId];
		if (!game) {
			game = await getPlayerGameData({ "playerId": userId });
		}

		return cb({
			"status": "success", "message": "Successfully fatch game detail.",
			"data": {
				"game": game
			}
		});
	}

	module.getStopHistory = async function (socket, data, cb) {
		try {
			if (!data.playerId) {
				return callback({ 'status': 'error', 'message': 'Please login.' });
			}
			let userId = data.playerId;

			let history = await model.LightingRoulette.findAll({
				"where": { "playerId": userId, "game_status": "completed" },
				"attributes": ["id", "stopped_on_number"],
				"order": [['id', 'DESC']],
				"limit": 25,
				"raw": true
			});
			return cb({
				"status": "success", "message": "Successfully get history.",
				"data": {
					"history": history
				}
			})
		} catch (error) {
			return cb({ "status": "error", "message": "Something went wrong." });
		}
	}

	module.updateScoket = async (socket, data) => {
		let aaip = await model.User.update({ "socketId": socket.id }, { where: { "id": data.playerId } });
	}

	async function getPlayerGameData(data) {
		var gameDetail = await model.LightingRoulette.findOne({
			where: { "playerId": data.playerId, "game_status": { [Op.ne]: "completed" } },
			order: [['id', 'DESC']]
		});
		RouletteMaster["plr" + data.playerId] = gameDetail;
		return gameDetail;
	}

	async function sendEmailToPlayer(data) {

		var bodyData = {
			email: data.email,
			subject: "Verification of the Fairness",
			template: ""
		};
		if (data.notificationType == "completed") {
			let getNumHash = await setNumHash(data.numericHash, data.stopNo);
			bodyData.template = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
			<html xmlns="http://www.w3.org/1999/xhtml">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
					<title>`+ process.env.siteName + `</title>
					<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,400i,500,700,700i,900,900i" rel="stylesheet">
					<style type="text/css">
					body {font-family: 'Roboto', sans-serif; font-size:14px; line-height:normal; margin:0; padding:0}
					
					.apo-box {background: #ebebeb;  border-radius: 5px; margin-bottom:20px}
					.h1 { font-weight: 700; padding-bottom: 15px; font-size: 25px; color: #000; text-align: left; }
					.h2 {font-weight: 700; padding: 0 0 20px; font-size: 25px; color: #000; text-align: left; margin: 0; text-transform: uppercase;}
					.bd {background: #fff;}
					.title { width: 100%; padding: 0 0 7px 0; float: left; font-weight: 700; }
					.title-detail { padding: 10px; float: left; width: 100%; background: #eeeeee;margin-bottom: 20px; }
					</style>
				</head>
				<body>
					<H2 style="margin-left:50px; padding: 20px 20px 0;">Hi `+ data.userName + `,</H2>
    				<p style="margin-left:80px;">This is your completed game round verification of the fairness detail</p>
					<table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; padding: 20px 20px 0;">
					<tr>
						<td>
							<!--header start-->
							<table width="100%" border="0" cellpadding="0" cellspacing="0" class="bdb-black">  
								<tr><td><h1 class="h1">Verification of the fairness</h1></td></tr>
								<tr><td><h2 class="h2">Round `+ data.roundNo + `</h2></td></tr>
							</table>
							<!--header end-->
							
							<table width="100%" border="0" cellpadding="0" cellspacing="0" class="apo-box" >
								<tr>
									<td class="bd">
										<div class="title">Round start Time</div> 
										<div class="title-detail">`+ data.roundStartTime + `</div>
									</td>
								</tr>
								<tr>
									<td class="bd">
										<div class="title">Game Hash:Sha256(Server Seed)</div> 
										<div class="title-detail">`+ data.gameHash + `</div>
									</td>
								</tr>
								<tr>
									<td class="bd">
										<div class="title">Server Seed</div> 
										<div class="title-detail">`+ data.serverSeed + `</div>
									</td>
								</tr>
							</table> 
						</td>
					</tr>
					<tr>
                        <td class="bd">
                            <div class="title">Client Seed</div>
                            <div class="title-detail">`+ data.clientSeed + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="bd">
                            <div class="title">Nonce</div>
                            <div class="title-detail">`+ data.nounce + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="bd">
                            <div class="title">Hash Generated : SHA512(Server Seed + Client Seed + Nonce)</div>
                            <div class="title-detail">
                                `+ data.hashGameSHA512 + `
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="bd">
                            <div class="title">Decimal of The Hash Generated</div>
                            <div class="title-detail">`+ getNumHash + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="bd">
                            <div class="title">Stop Number</div>
                            <div class="title-detail">`+ data.stopNo + `</div>
                        </td>
                    </tr>
					</table>
				</body>
			</html>`;
		} else {
			bodyData.template = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
			<html xmlns="http://www.w3.org/1999/xhtml">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
					<title>`+ process.env.siteName + `</title>
					<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,400i,500,700,700i,900,900i" rel="stylesheet">
					<style type="text/css">
					body {font-family: 'Roboto', sans-serif; font-size:14px; line-height:normal; margin:0; padding:0}
					
					.apo-box {background: #ebebeb;  border-radius: 5px; margin-bottom:20px}
					.h1 { font-weight: 700; padding-bottom: 15px; font-size: 25px; color: #000; text-align: left; }
					.h2 {font-weight: 700; padding: 0 0 20px; font-size: 25px; color: #000; text-align: left; margin: 0; text-transform: uppercase;}
					.bd {background: #fff;}
					.title { width: 100%; padding: 0 0 7px 0; float: left; font-weight: 700; }
					.title-detail { padding: 10px; float: left; width: 100%; background: #eeeeee;margin-bottom: 20px; }
					</style>
				</head>
				<body>
					<H2 style="margin-left:50px; padding: 20px 20px 0;">Hi `+ data.userName + `,</H2>
    				<p style="margin-left:80px;">This is the part of the verification of the current round before the end of the bets . The value of the server seed is definitively set . This value is hidden into its game hash . The server seed will be used for the calculation of the stop number along with the client seed and the nonce .
					After the end of the game when the value of the server seed is disclosed ,you can verify the Game hash was really the one of teh server seed .</p>
					<table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 640px; margin: 0 auto; padding: 20px 20px 0;">
					<tr>
						<td>
							<!--header start-->
							<table width="100%" border="0" cellpadding="0" cellspacing="0" class="bdb-black">  
								<tr><td><h1 class="h1">Verification of the fairness</h1></td></tr>
								<tr><td><h2 class="h2">Round `+ data.roundNo + `</h2></td></tr>
							</table>
							<!--header end-->
							
							<table width="100%" border="0" cellpadding="0" cellspacing="0" class="apo-box" >
								<tr>
									<td class="bd">
										<div class="title">Round start Time</div> 
										<div class="title-detail">`+ data.roundStartTime + `</div>
									</td>
								</tr>
								<tr>
									<td class="bd">
										<div class="title">Game Hash:Sha256(Server Seed)</div> 
										<div class="title-detail">`+ data.gameHash + `</div>
									</td>
								</tr>
								<tr>
									<td class="bd">
										<div class="title">Server Seed</div> 
										<div class="title-detail">The Server Seed is not disclosed at this time.</div>
									</td>
								</tr>
							</table> 
						</td>
					</tr>
					</table>
				</body>
			</html>`;
		}
		return await helper.SendEmail(bodyData);
	}
	async function setNumHash(hash, stopno) {
		var arra = hash.match(/.{1,2}/g)
		var strhash = "";
		var isfind = false;
		for (var item = 0; item < arra.length; item++) {
			if (parseInt(arra[item]) == parseInt(stopno)) {
				if (!isfind) {
					isfind = true;
					strhash += " " + '<span class="hashstop" style="background-color: yellow;font-weight: bold;font-size: medium;">' + arra[item] + '</span>'
				} else {
					strhash += " " + arra[item]
				}
			} else {
				strhash += " " + arra[item]
			}
		}
		return strhash;
	}

	return module;
}
async function winAmountLogic(betAmount, isSelecter, isSelecterNo) {
	let winAmount = 0;
	let net_winning_amout = 0;
	if (isSelecter == "1") {
		if (parseInt(isSelecterNo) >= 1 && 6 >= parseInt(isSelecterNo)) {
			net_winning_amout = (parseFloat(betAmount) * 3) - parseFloat(betAmount)
			winAmount = (parseFloat(betAmount) * 3);
		} else {
			net_winning_amout = (parseFloat(betAmount) * 2) - parseFloat(betAmount);
			winAmount = (parseFloat(betAmount) * 2)
		}
	} else {
		net_winning_amout = (parseFloat(betAmount) * 36) - parseFloat(betAmount);
		winAmount = (parseFloat(betAmount) * 36);
	}
	return { winAmount: winAmount, net_winning_amout: net_winning_amout };
}

