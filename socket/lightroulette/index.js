var flagLR = true;
module.exports = function (model, io, socket) {
	var config = require('../../config/constants.js');
	var LightRoulette = require('./light_roulette')(model, config);


	socket.on("ReconnectPlayer", (data, cb) => {
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
			socket.user = {};
			socket.playerId = data.userId;
			LightRoulette.updateScoket(socket, data1);
		}
	});

	socket.on("disconnect", () => {
		if (socket.user) {
			let data = {
				playerId: socket.user.playerId
			}
			socket.id = "";
			delete playerDetail["plr" + data.userId];	
			LightRoulette.updateScoket(socket, data);
			socket.user = {};
		}
	});
	
	//start : betStopNumberHistory socket on	
	socket.on("BetHistory",(data, cb) => {
		LightRoulette.getBetHistory(socket, data, (res) => {
			// if(res.status == 'success'){
			// 	console.log('res -->', res);
			// }
		 return cb(res);
		})
	})
	//end : betStopNumberHistory socket on

	// Start New Event  Development
	socket.on("ReconnectGame", (data, cb) => {
		LightRoulette.getPlayerGame(socket, data, (res) => {
			if (res.status == "success") {
				if (res.data.game.game_status == "started") {
					playerDetail["plr" + data.playerId].isGame = true;
					if (!res.data.game.stopped_on_number) { 
						LightRoulette.getRouletteStopNumber(socket, { 'playerId': res.data.playerId }, (resSpin) => {
							io.to("plr" + data.playerId).emit("getStopNumberEvent", resSpin);
						});
					}else {
						io.to("plr" + data.playerId).emit("getStopNumberEvent", {
							"status": "success",
							"message": "Spin",
							"data": {
								"stopped_on_number": res.data.game.stopped_on_number,
								"rouletSpinTimer": (res.data.game.isTurbo == "1") ? 50 : 15000
							}
						});
					}
				} else {
					// console.log('res.data.history.length -->', res.data.history.length);
					if (res.data.history.length > 0) {
						console.log('yes');
						if (!res.data.game.stopped_on_number) {
							LightRoulette.getRouletteStopNumber(socket, { 'playerId': res.data.playerId }, (resSpin) => {
								playerDetail["plr" + data.playerId].isGame = true;
								io.to("plr" + data.playerId).emit("getStopNumberEvent", resSpin);
							});
						} else {
							playerDetail["plr" + data.playerId].isGame = false;
							io.to("plr" + data.playerId).emit("getStopNumberEvent", {
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

	socket.on("getGame", (data, cb) => {
		LightRoulette.gameDetail(socket, data, (res) => {
			return cb(res);
		});
	});

	socket.on("placeBet", (data, cb) => {
		// console.log('placebet data ->', data);	
		LightRoulette.placeBet(socket, data, (res) => {
			// console.log('req -->', res);
			if (res.status == "success") {
				playerDetail["plr" + res.data.userDetail.id].isGame = true;
				LightRoulette.getRouletteStopNumber(socket, { 'playerId': res.data.userDetail.id }, (resSpin) => {
					io.to("plr" + data.playerId).emit("getStopNumberEvent", resSpin);
				});
			}
			return cb(res);
		});
	});

	socket.on("spinRoulette", (data, cb) => {
		console.log('spinRoulette data ->', data);
		console.log('spinRoulette cb ->', cb);
		LightRoulette.getRouletteStopNumber(socket, data, (res) => {
			playerDetail["plr" + data.playerId].isGame = true;
			io.to("plr" + data.playerId).emit("getStopNumberEvent", res);
			return cb(res);
		});
	});

	socket.on("rouletteStopEvent", (data, cb) => {
		LightRoulette.gameWinningLogic(socket, data, (res) => {
			if (res.status == "success") {
				io.to("plr" + data.playerId).emit("gamecompleteEvent", res);
				LightRoulette.createNewGame(socket, data, (game) => {
					playerDetail["plr" + data.playerId].isGame = false;
					setTimeout(() => {
						io.to("plr" + data.playerId).emit("newgame", game);
					}, 2000);
				});
				return cb({ "status": "success", "message": "", "data": {} });
			} else {
				return cb(res);
			}
		});
	});

	socket.on("reBet", (data, cb) => {
		LightRoulette.gameRebeat(socket, data, (res) => {
			return cb(res);
		});
	});

	socket.on("previousStopNum", (data, cb) => {
		LightRoulette.getStopHistory(socket, data, (res) => {
			return cb(res);
		});
	});

}