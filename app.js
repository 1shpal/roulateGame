var express = require('express');
var app = express();

var env = require("./config/env");
process.env = { ...process.env, ...env() };

// console.log(" process.env : ", process.env)

var flash = require('connect-flash');
var path = require('path');
var cookieParser = require('cookie-parser');
var store = require('store');
global.store = store;
global.moment = require('moment');

var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
var fileUpload = require('express-fileupload');
const expressValidator = require('express-validator');
const Cryptr = require('cryptr');
global.cryptr = new Cryptr('myTotalySecretKey');

var nunjucks = require('nunjucks');
global.now = new Date();
global.dateFormat = dateFormat;

//for dev and stg
// var https_options = {
// 	key: fs.readFileSync('public/SSL/aistechnolabsclub_private_key.key'),
// 	cert: fs.readFileSync('public/SSL/aistechnolabsclub_ssl.pem')
//   }; 
// var server = require('https').Server(https_options, app);

//for local
var server = require('http').createServer(app);

io = require('socket.io')(server);

//var mongoose = require('mongoose');
//require('./config/database.js')(mongoose);
var Sequelize = require('sequelize');
global.Sequelize = Sequelize;
var sequelizeDB = require('./config/database.js')(Sequelize);
// require('./config/logconfig.js');
var { depositLogger, withdrawLogger } = require("./config/logconfig");
global.depositLogger = depositLogger;
global.withdrawLogger = withdrawLogger;


app.use(expressValidator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//view engine setup
app.use(express.static(path.join(__dirname, 'public')));
nunjucks.configure('app/views', {
  autoescape: false,
  express: app,
  watch: true
});
app.set('view engine', 'html');


//set in headers in every request
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(cookieSession({
  name: 'session',
  keys: ["bitroulcookie"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(flash());
app.use(fileUpload());

//Start: Load model, controller, helper, and route
//var model = require('./app/models/mongo/index')(mongoose);
var model = require('./app/models/mysql/index')(Sequelize, sequelizeDB);
var controllers = require('./app/controllers/index')(model);
require('./routes/index.js')(app, model, controllers);

global.helper = require('./app/helpers/helpers.js');
//End: Load model, controller, helper, and route

//Start: Server connection
server.listen(process.env.port, function () {
  console.log("(---------------------------------)");
  console.log("|         Server Started...       |");
  console.log("|    " + process.env.baseUrl + "    |");
  console.log("(---------------------------------)");
});
//End: Server connection

global.guestCount = 0

var socket_count = 0;
global.RouletteMaster = {};
global.RouletteHistory = [];
global.SettingMaster = {};
global.CurrencyMaster = [];
global.playerDetail = {};

global.guestManagment = {
  id: "",
  name: "",
  clientSheed: "",
  socketId: "",
  status: "1",
  wallate: {},
  guestProvablyFair: {},
  gameMaster: {},
  gameHistory: [],
  lastGame: {},
  firework: {}
}
GetSetting();
async function GetSetting() {
  
  SettingMaster = await model.Setting.findOne({});
  // console.log('SettingMaster-->', SettingMaster);

  CurrencyMaster = await model.CurrencyMaster.findAll({ raw: true });
  let GetCmsPage = await model.Cms.findAll({ where: { "isShowOnScreen": "1" } }, { raw: true });
  store.set("showCms", GetCmsPage);
}

//Start: Socket connection code
global.io = io;

io.on('connection', function (client) {
  socket_count++;
  // io.emit('count', socket_count);
  global.socket = client;
  console.log("Socket connection established", socket_count);
  console.log("New Socket Id", client.id);
  require('./socket/index')(model, io, client);
  client.on('disconnect', function () {
    socket_count--;
    // io.emit('count', socket_count);
    console.log("Socket disconnected", socket_count);
  });

});
//End: Socket connection code

require('./config/error.js')(app);

module.exports = { app: app, server: server }
