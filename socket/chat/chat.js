const Op = Sequelize.Op;
var dateformat = require('dateformat');
module.exports = function(model){
	var module = {};

	module.getMessages = async function(callback){
		try{
			var chat = await model.Chat.findAll({limit: 100,order:[['id','DESC']] });
			if(chat.length> 0){
				lastId = chat[chat.length-1].id;
			}else{
				lastId = 1;
			}
			model.Chat.findAll({where : {id : {[Op.gte] : lastId} }, include:[{model:model.User, as:'userDetail'}]}).then(function (chatData) {
				callback({'status':'success','message':'Chat Available.','data':chatData});
			});
		}catch(error){
			console.log("Error when chat messages getting: ", error);
			callback({'status':'fail','message':'Chat Not Available.'});
		}		
	};
	module.chatMessageSave = async function(data, callback){
		try{
			if(data != null){
				var userId = data.userId;
				if(userId != null && userId != 0 && userId != undefined){
					var message = data.message;
					if(message != null && message != undefined && message != ""){
						var checkstr =  helper.chekStringlength(message,250);
						if(checkstr){
							var profileDetail = await model.User.findById(userId).then(profileRes=>{
								return profileRes;
							});
							if(profileDetail.user_can_chat == '1'){
								var chatResult = await model.Chat.create({'chat_message':message,"user_id":userId, 'anymos' : profileDetail.anymos },{raw: true}).then(chatRes=>{
									return chatRes;
								}).catch(function(chatErr){																
									callback({'status':'fail','message':'Somthing Wrong, Please Try Again.'});
								});
		
								if(chatResult != null){
									await model.Chat.findOne({where:{"id":chatResult.id}, include:[{model:model.User,as:'userDetail'}]}).then(chatDetail=> {
										callback({'status':'success','message':'Message Send Successfully.', data:chatDetail});
									});
								}else{								
									callback({'status':'fail','message':'Somthing Wrong, Please Try Again.'});
								}
							}else{
								callback({'status':'fail','message':"Your Chatting Is Block, Please Contact To Administrator."});									
							}							
						}else{
							callback({'status':'fail','message':'Please Write Message In 250 Character Only.'});
						}						
					}else{						
						callback({'status':'fail','message':'Please Enter Message.'});
					}
				}else{					
					callback({'status':'fail','message':'Please Logout And After Login.'});
				}
			}else{				
				callback({'status':'fail','message':"Something Went Wrong, Please  Refresh The Page."});
			}
		}catch(error){	
			console.log(error);		
			callback({'status':'fail','message':"Something Went Wrong, Please  Refresh The Page."});
		}		
	};
	return module;
};