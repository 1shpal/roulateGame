import _ from 'lodash';
import io from 'socket.io-client';
import $ from 'jquery';
window.jQuery = $;
import DataTable from 'datatables.net';

console.log = function () { };
window.socketUrl = baseUrl.replace(/\/$/, "");
window.engine = io(baseUrl);
engine.on("connect", () => {
    console.log("Socket Connection On");
    engine.emit("ReconnectPlayer", { "userId": userId }, (res) => { });
});