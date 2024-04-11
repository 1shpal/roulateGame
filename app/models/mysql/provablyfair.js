
module.exports = function (Sequelize, Schema) {
    // console.log("getHash", getHash(40));
    var provablyFair = Schema.define('provablyFair', {
        roundNo: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        roundStartTime: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        noramlServerSeed: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        serverSheed: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        spinTime: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        nounce: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        gameHash: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        numericHash: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        stopNoTime: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        wheelStopTime: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        revealedServerSheed: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        stopNoRoulette: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        clientSheedUpdateTime: {
            type: Sequelize.DATE,
            defaultValue: null
        },
        clientSheed: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        status: {
            type: Sequelize.ENUM('active', 'completed'),
            defaultValue: 'active'
        },
        userId: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
        gameId: {
            type: Sequelize.STRING,
            defaultValue: ""
        },
    }, { underscored: true });

    provablyFair.sync({ force: false });

    return provablyFair;
}