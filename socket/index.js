module.exports = function (model, io, client) {
	require('./chat/index.js')(model, io, client);
	require('./lightroulette/index.js')(model, io, client);
	require('./lightroulette/index_guest.js')(model, io, client);
	require('./common/index.js')(model, io, client);
}