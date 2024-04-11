const Op = Sequelize.Op;
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

	module.getPlayerGame = async function (socket, data, cb) {
		try {

			if (!data.playerId) {
				return cb({ "status": "error", "message": "Please login." });
			}
			let guestDetail = guestManagment[data.playerId];
			if (!guestDetail) {
				return cb({ 'status': 'error', 'message': 'Player detail not found.' });
			}
			socket.user = {};

			data.playerId = playerDetail.id;
			socket.user.playerId = playerDetail.id;
			socket.user.name = playerDetail.name;

			if (Object.keys(guestDetail.gameMaster).length > 0) {
				let getHistory = guestDetail.gameHistory;
				if (guestDetail.gameMaster.game_status == "started") {
					if (!guestDetail.gameMaster.stopped_on_number || guestDetail.gameMaster.stopped_on_number < 0) {
						guestDetail.gameMaster.stopped_on_number = await getRandomNumber();
					}
				}
				RouletteMaster["plr" + data.playerId] = guestDetail.gameMaster;

				socket.join("plr" + data.playerId);

				io.to("plr" + data.playerId).emit("guestCurrentGame", guestDetail.gameMaster);

				return cb({
					"status": "success",
					"message": "",
					"data": {
						"playerId": data.playerId,
						"totalWinCnt": 0,
						"game": guestDetail.gameMaster,
						"history": getHistory,
						"previewGame": {
							"lastStopNo": (guestDetail.lastGame) ? guestDetail.lastGame.stopped_on_number : "",
							"lastWinStopNo": (guestDetail.lastGame) ? guestDetail.lastGame.stopped_on_number : ""
						}
					}
				});
			} else {
				var getLastgame = guestDetail.lastGame;
				var gameNo = 1;
				if (Object.keys(getLastgame).length > 0) {
					gameNo = gameNo + parseInt(getLastgame.game_number);
				}
				let clsSheed = guestDetail.clientSheed;
				if (guestDetail.clientSheed == "0" || !guestDetail.clientSheed) {
					clsSheed = await helper.getClientSheed();
				}

				if (Object.keys(guestDetail.guestProvablyFair).length <= 0) {
					/* Provably Fair Updates */
					let serverSheed = await helper.getServerSheed();
					guestDetail.guestProvablyFair = {
						"roundStartTime": moment().format("hh:mm:ss"),
						"roundNo": gameNo,
						"noramlServerSeed": serverSheed,
						"serverSheed": await helper.SHA256(serverSheed),
						"clientSheed": clsSheed,
						"clientSheedUpdateTime": new Date(),
						"spinTime": "",
						"nounce": "",
						"gameHash": "",
						"numericHash": "",
						"stopNoTime": "",
						"wheelStopTime": "",
						"revealedServerSheed": "",
						"stopNoRoulette": "",
						"status": "active"
					}

					io.to("plr" + data.playerId).emit("guestGetFairSheed",
						{
							"serverSheed": guestDetail.guestProvablyFair.serverSheed,
							"revealedServerSheed": "",
							"clientSheed": guestDetail.guestProvablyFair.clientSheed
						});
				}

				var gameData = {
					"id": gameNo,
					"game_number": gameNo,
					"game_hash": guestDetail.guestProvablyFair.serverSheed,
					"hashGenerated": "",
					"game_hash_createDate": "",
					"stopped_on_number": "",
					"bet_amount": 0,
					"totalChipsBet": 0,
					"admin_commission": parseInt(SettingMaster.roulette_commission),
					"admin_commission_price": 0,
					"game_status": "pending",
					"isBeyond": "0",
					"winning_amount": 0,
					"totalWinAmountShow": 0,
					"currencyRate": 1,
					"isTurbo": "0"
				};

				guestDetail.gameMaster = gameData;
				RouletteMaster['plr' + data.playerId] = gameData;

				socket.join("plr" + data.playerId);

				io.to("plr" + data.playerId).emit("guestCurrentGame", gameData);
				return cb({
					"status": "success",
					"message": "",
					"data": {
						"playerId": data.playerId,
						"totalWinCnt": 0,
						"game": guestDetail.gameMaster,
						"history": [],
						"previewGame": {
							"lastStopNo": (Object.keys(getLastgame) > 0) ? getLastgame.stopped_on_number : "",
							"lastWinStopNo": (Object.keys(getLastgame) > 0) ? getLastgame.stopped_on_number : ""
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
			if (!data) {
				return callback({ 'status': 'error', 'message': 'Place bet detail not found.' });
			}
			if (!data.walletId) {
				return callback({ 'status': 'error', 'message': 'Please select currency for place bet.' });
			}
			let guestDetail = guestManagment[data.playerId];
			if (!guestDetail) {
				return callback({ 'status': 'error', 'message': 'Player detail not found.' });
			}

			let isValid = await checkBetAmount(data.placeBetObj);
			if (isValid.status != "success") {
				return callback(isValid);
			}
			if (data.placeBetObj.totalBetAmount <= 0) {
				return callback({ 'status': 'error', 'message': 'Please enter bet amount.' });
			}
			if (!guestDetail.clientSheed || guestDetail.clientSheed == null) {
				return callback({ 'status': 'alert', 'message': 'Please update your client seed.' });
			}

			let game = guestDetail.gameMaster;
			// console.log('game -->', game);
			if (!game) {
				return callback({ 'status': 'alert', 'message': 'Game detail not found.' });
			}
			let isJoin = guestDetail.gameHistory;
			if (isJoin.length > 0) {
				return callback({ 'status': 'error', 'message': 'You have already placed your bet.' });
			}

			let chipsBetAmout = parseFloat(data.placeBetObj.totalBetAmount) / 1;

			if (parseFloat(guestDetail.wallate.main_balance) < parseFloat(chipsBetAmout)) {
				return callback({ 'status': 'error', 'message': 'Insufficient chips in your wallet.' });
			}

			guestDetail.gameHistory = data.placeBetObj.playerSelectBet;

			guestDetail.gameMaster.bet_amount = parseFloat(data.placeBetObj.totalBetAmount)
			guestDetail.gameMaster.totalChipsBet = parseFloat(data.placeBetObj.totalChipsBetAmount)
			guestDetail.gameMaster.isTurbo = (data.isTurbo == true || data.isTurbo == "true") ? "1" : "0"

			guestDetail.wallate.main_balance = parseFloat(parseFloat(guestDetail.wallate.main_balance) - parseFloat(chipsBetAmout)).toFixed(4);

			let getProvably = guestDetail.guestProvablyFair;
			getProvably.nounce = (data.currenttime) ? data.currenttime : moment().format("hh:mm:ss")

			return callback({
				"status": "success",
				"message": "Successfully placed bet",
				"data": {
					"userDetail": guestDetail,
					"walletDetail": guestDetail.wallate
				}
			});

		} catch (error) {
			console.log("error", error);
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

	//-----  Start Game Logic ------//
	module.getRouletteStopNumber = async function (socket, data, callback) {
		if (!data.playerId) {
			return callback({ 'status': 'error', 'message': 'Please login.' });
		}
		let guestDetail = guestManagment[data.playerId];
		if (!guestDetail) {
			return callback({ 'status': 'error', 'message': 'Player detail not found.' });
		}
		let game = guestDetail.gameMaster;
		if (!game) {
			return callback({ 'status': 'alert', 'message': 'Game detail not found.' });
		}

		let isJoin = guestDetail.gameHistory.length;
		if (isJoin <= 0) {
			return callback({ 'status': 'error', 'message': 'You have already placed your bet.' });
		}

		let getProvably = guestDetail.guestProvablyFair;
		let nounce = (getProvably.nounce) ? getProvably.nounce : moment().format("hh:mm:ss");
		let gameHash = await helper.SHA512(getProvably.noramlServerSeed + getProvably.clientSheed + nounce);

		let getHaxData = await helper.getProvablyStopNo(gameHash);

		getProvably.spinTime = nounce;
		getProvably.nounce = nounce;
		getProvably.gameHash = gameHash;
		getProvably.numericHash = getHaxData.decimalHash;
		getProvably.stopNoTime = getHaxData.stopNumber;

		guestDetail.gameMaster.game_status = "started";
		guestDetail.gameMaster.hashGenerated = gameHash;
		guestDetail.gameMaster.stopped_on_number = (getHaxData.stopNumber).toString();

		let rouletSpinTimer = (guestDetail.gameMaster.isTurbo == "1") ? 50 : 15000

		return callback({
			"status": "success",
			"message": "Spin",
			"data": {
				"stopped_on_number": (getHaxData.stopNumber).toString(),
				"rouletSpinTimer": rouletSpinTimer
			}
		});
	};

	module.gameWinningLogic = async function (socket, data, callback) {

		let stopWheelTime = moment().format("hh:mm:ss");

		if (!data.playerId) {
			return callback({ 'status': 'error', 'message': 'Please login.' });
		}

		let userId = data.playerId;
		let guestDetail = guestManagment[data.playerId];
		if (!guestDetail) {
			return callback({ 'status': 'error', 'message': 'Player detail not found.' });
		}
		let game = guestDetail.gameMaster;
		if (!game) {
			return callback({ 'status': 'alert', 'message': 'Game detail not found.' });
		}
		if (game.game_status == "completed") {
			return callback({ 'status': 'error', 'message': '' });
		}
		game.game_status = "completed";

		let gameHistory = guestDetail.gameHistory;
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
					totalWin += parseFloat(winRes.winAmount);
					totalNetWin += parseFloat(winRes.net_winning_amout)
				} else {
					totalLost += parseFloat(gameHistory[plr].chipsBetAmount)
					gameHistory[plr].is_won = "no";
					gameLosers.push(gameHistory[plr]);
				}
			}
		}

		let admin_commission = 0;

		let totalWinAmoutShow = totalWin;

		admin_commission = parseFloat(parseInt(game.admin_commission) * parseFloat(totalWin)) / 100;
		totalWin = totalWin - admin_commission;

		game.winning_amount = totalWin;
		game.game_status = "completed";
		// game.game_hash = "";

		delete RouletteMaster["plr" + userId];

		var walleteDetail = guestDetail.wallate;
		let isWin = false;
		var totalWinAmoutinChisp = 0;
		var netTotalGain = 0;
		// console.log("gameWinners", gameWinners);
		if (gameWinners.length > 0) {
			isWin = true;
			walleteDetail.main_balance = parseFloat(parseFloat(walleteDetail.main_balance) + parseFloat(totalWin)).toFixed(4)
			totalWinAmoutinChisp = parseFloat(totalWinAmoutShow) * 1;

			netTotalGain = totalWinAmoutinChisp - parseFloat(game.bet_amount);
		}

		guestDetail.guestProvablyFair.wheelStopTime = stopWheelTime;
		guestDetail.guestProvablyFair.revealedServerSheed = guestDetail.guestProvablyFair.serverSheed;
		guestDetail.guestProvablyFair.stopNoRoulette = game.stopped_on_number;
		guestDetail.guestProvablyFair.status = "completed"



		guestDetail.gameMaster.totalWinAmountShow = totalWinAmoutinChisp;
		guestDetail.gameMaster.winning_amount = totalWinAmoutShow;
		guestDetail.gameMaster.game_status = "completed";
		guestDetail.gameMaster.game_hash_createDate = new Date();
		guestDetail.gameMaster.admin_commission_price = parseFloat(admin_commission)

		guestDetail.lastGame = guestDetail.gameMaster;
		let resdata = {
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
			},
			"gameMaster": guestDetail.gameMaster,
			"gameHistory": guestDetail.gameHistory,
			"provalyFair": guestDetail.guestProvablyFair
		};

		guestDetail.gameMaster = {};
		guestDetail.gameHistory = [];
		guestDetail.guestProvablyFair = {};
		return callback(resdata);
	};
	module.createNewGame = async function (socket, data, cb) {
		if (!data.playerId) {
			return cb({ 'status': 'error', 'message': 'Player id not found.' });
		}

		let guestDetail = guestManagment[data.playerId];
		if (!guestDetail) {
			return callback({ 'status': 'error', 'message': 'Player detail not found.' });
		}
		var getLastgame = guestDetail.lastGame;
		var gameNo = 1;
		if (Object.keys(getLastgame).length > 0) {
			gameNo = gameNo + parseInt(getLastgame.game_number);
		}
		let serverSheed = await helper.getServerSheed();
		guestDetail.guestProvablyFair = {
			"roundStartTime": moment().format("hh:mm:ss"),
			"roundNo": gameNo,
			"noramlServerSeed": serverSheed,
			"serverSheed": await helper.SHA256(serverSheed),
			"clientSheed": guestDetail.clientSheed,
			"clientSheedUpdateTime": new Date(),
			"spinTime": "",
			"nounce": "",
			"gameHash": "",
			"numericHash": "",
			"stopNoTime": "",
			"wheelStopTime": "",
			"revealedServerSheed": "",
			"stopNoRoulette": "",
			"status": "active"
		}

		io.to("plr" + data.playerId).emit("guestGetFairSheed",
			{
				"serverSheed": guestDetail.guestProvablyFair.serverSheed,
				"revealedServerSheed": "",
				"clientSheed": guestDetail.guestProvablyFair.clientSheed
			});

		var gameData = {
			"id": gameNo,
			"game_number": gameNo,
			"game_hash": guestDetail.guestProvablyFair.serverSheed,
			"hashGenerated": "",
			"game_hash_createDate": "",
			"stopped_on_number": "",
			"bet_amount": 0,
			"totalChipsBet": 0,
			"admin_commission": parseInt(SettingMaster.roulette_commission),
			"admin_commission_price": 0,
			"game_status": "pending",
			"isBeyond": "0",
			"winning_amount": 0,
			"totalWinAmountShow": 0,
			"currencyRate": 1,
			"isTurbo": "0"
		};

		guestDetail.gameMaster = gameData;

		RouletteMaster['plr' + data.playerId] = gameData;

		let res = {
			"status": "success",
			"message": "",
			"data": {
				"game": guestDetail.gameMaster,
				"history": [],
				"previewGame": guestDetail.lastGame
			}
		};
		io.to("plr" + data.playerId).emit("guestCurrentGame", guestDetail.gameMaster);
		return cb(res);
	}
	//----- End Game Logic --------//

	module.gameDetail = async function (socket, data, cb) {
		if (!data.playerId) {
			return callback({ 'status': 'error', 'message': 'Player id not found.' });
		}
		let guestDetail = guestManagment[data.playerId];
		if (!guestDetail) {
			return callback({ 'status': 'error', 'message': 'Player detail not found.' });
		}
		let game = guestDetail.gameMaster;
		return cb({
			"status": "success", "message": "Successfully fatch game detail.",
			"data": {
				"game": game
			}
		});
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

