var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
/* Start Send Email Methods */
var transporter = nodemailer.createTransport(smtpTransport({
    host: process.env.smtphost,
    port: process.env.smtpport,
    secure: false,
    ignoreTLS: true,
    auth: {
        user: process.env.supportEmail,
        pass: process.env.password
    }
}));
module.exports.SendEmail = async (body) => {
    try {
        var mailOptions = {
            from: process.env.supportEmail,
            to: body.email,
            subject: process.env.siteName + ': ' + body.subject,
            html: body.template
        };
        var send = await transporter.sendMail(mailOptions);
        if (send) {
            return { "status": true, "message": "Successfully send." }
        } else {
            return { "status": false, "message": "Something went wrong. Please try after some time." }
        }
    } catch (error) {
        console.log("Send Email Error", error);
        if (error.response) {
            return { "status": false, "message": error.response }
        } else {
            return { "status": false, "message": "An error occurred while sending mail. The mail server response" + error.code }
        }
    }
}
/* End Send Email Methods */

/* Start:  Roulette Game Provably Fair Methods */

module.exports.guestPlayer = async () => {
    return "R" + "Guest" + await this.gameNumber(2) + await this.randomString(2);
}
module.exports.getServerSheed = async () => {
    return this.randomString(50);
}
module.exports.getClientSheed = async () => {
    return this.randomString(this.getRandomInt(12, 20));
}
module.exports.SHA256 = async (str) => {
    return crypto.createHash('sha256').update(str).digest('hex')
}
module.exports.SHA512 = async (str) => {
    return crypto.createHash('sha512').update(str).digest('hex')
}
module.exports.PreHash = async () => {
    return crypto.createHash('sha256').update(this.randomString(50)).digest('hex')
}

module.exports.getProvablyStopNo = async (hash) => {
    let val = 0;
    let stopNumber = "";
    let decimalHash = "";
    for (var i = 0; i < hash.length; i += 2) {
        val = parseInt(hash.substring(i, i + 2), 16) % 100;
        if (val > 0 && val < 37) {
            if (!stopNumber) {
                stopNumber = val;
            }
        }
        let strNo = "";
        if (val < 10) {
            strNo = "0" + val.toString();
        } else {
            strNo = val.toString();
        }
        val.toString()
        decimalHash += strNo;
    }
    return { "stopNumber": stopNumber, "decimalHash": decimalHash };
}

/* End: Roulette Game Provably Fair Methods */
module.exports.gameNumber = async function (length) {
    var chars = '0123456789';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};
module.exports.randomString = function (length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

module.exports.randomOnlyNumber = function (length) {
    var chars = '0123456789';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};
module.exports.getNumber = function (length) {
    var chars = '3456';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

    return result;
};
module.exports.getRandomInt = function (min, max) {
    var reandomNo = Math.floor(Math.random() * (max - min + 1) + min);
    return reandomNo;
};
module.exports.getRandomNumArray = function (items) {
    return items[Math.floor(Math.random() * items.length)];
};

module.exports.chekStringlength = function (str, size) {
    if (str.length < size) {
        return true;
    } else {
        return false;
    }
}
