var flagLR = true;
module.exports = function (model, io, socket) {
	var config = require('../../config/constants.js');
	var GuestLightRoulette = require('./light_roulette_guest')(model, config);


	socket.on("guestReconnectPlayer", (data, cb) => {
		if (data.userId) {
			let data1 = {
				playerId: data.userId
			}
			playerDetail["plr" + data.userId] = {
				socketId: socket.id,
				isOnline: true,
				isGame: false
			};
			socket.join("plr" + data.userId);
			socket.user = {
				playerId: data.userId
			};
			socket.playerId = data.userId;
			return cb({ "status": "success", "message": "success" });
		}
	});

	socket.on("disconnect", () => {
		if (socket.user) {
			let data = {
				playerId: socket.playerId

			}
			socket.id = "";
			delete playerDetail["plr" + data.userId];
			socket.user = {};
		}
	});

	// Start New Event  Development
	socket.on("guestReconnectGame", (data, cb) => {
		GuestLightRoulette.getPlayerGame(socket, data, (res) => {
			if (res.status == "success") {
				if (res.data.game.game_status == "started") {

					if (!res.data.game.stopped_on_number) {
						GuestLightRoulette.getRouletteStopNumber(socket, { 'playerId': res.data.playerId }, (resSpin) => {
							io.to("plr" + res.data.playerId).emit("guestGetStopNumberEvent", resSpin);
						});
					} else {
						io.to("plr" + res.data.playerId).emit("guestGetStopNumberEvent", {
							"status": "success",
							"message": "Spin",
							"data": {
								"stopped_on_number": res.data.game.stopped_on_number,
								"rouletSpinTimer": (res.data.game.isTurbo == "1") ? 50 : 15000
							}
						});
					}
				} else {
					if (res.data.history.length > 0) {
						if (!res.data.game.stopped_on_number) {
							GuestLightRoulette.getRouletteStopNumber(socket, { 'playerId': res.data.playerId }, (resSpin) => {

								io.to("plr" + res.data.playerId).emit("guestGetStopNumberEvent", resSpin);
							});
						} else {
							playerDetail["plr" + res.data.playerId].isGame = false;
							io.to("plr" + res.data.playerId).emit("guestGetStopNumberEvent", {
								"status": "success",
								"message": "Spin",
								"data": {
									"stopped_on_number": res.data.game.stopped_on_number,
									"rouletSpinTimer": (res.data.game.isTurbo == "1") ? 50 : 15000
								}
							});
						}
					}
				}
			}
			return cb(res);
		});
	});

	socket.on("guestGetGame", (data, cb) => {
		GuestLightRoulette.gameDetail(socket, data, (res) => {
			return cb(res);
		});
	});

	socket.on("guestPlaceBet", (data, cb) => {
		GuestLightRoulette.placeBet(socket, data, (res) => {
			if (res.status == "success") {
				GuestLightRoulette.getRouletteStopNumber(socket, { 'playerId': data.playerId }, (resSpin) => {

					io.to("plr" + socket.playerId).emit("guestGetStopNumberEvent", resSpin);
				});
			}
			return cb(res);
		});
	});

	socket.on("guestSpinRoulette", (data, cb) => {
		GuestLightRoulette.getRouletteStopNumber(socket, data, (res) => {
			io.to("plr" + socket.playerId).emit("guestGetStopNumberEvent", res);
			return cb(res);
		});
	});

	socket.on("guestRouletteStopEvent", (data, cb) => {
		GuestLightRoulette.gameWinningLogic(socket, data, (res) => {
			if (res.status == "success") {
				io.to("plr" + socket.playerId).emit("guestGamecompleteEvent", res);
				GuestLightRoulette.createNewGame(socket, data, (game) => {
					setTimeout(() => {
						io.to("plr" + socket.playerId).emit("guestNewgame", game);
					}, 2000);
				});
				return cb({ "status": "success", "message": "", "data": {} });
			} else {
				return cb(res);
			}
		});
	});

	socket.on("guestCurrentSeed", (data, cb) => {
		if (!data.playerId) {
			return cb({ "status": "error", "message": "Player id not found. Please login" });
		}
		let guestDetail = guestManagment[data.playerId];
		if (!guestDetail) {
			return cb({ 'status': 'error', 'message': 'Player detail not found' });
		}
		let getProvably = guestDetail.guestProvablyFair;
		if (!data.roundNo) {
			return cb({ 'status': 'success', 'message': '', "data": { getProvably: getProvably, gameDetail: guestDetail.gameMaster } });
		}
		if (getProvably.roundNo != data.roundNo) {
			return cb({ 'status': 'error', 'message': 'Fairness detail not found.' });
		}
		return cb({ 'status': 'success', 'message': '', "data": { getProvably: getProvably, gameDetail: guestDetail.gameMaster } });
	});

}