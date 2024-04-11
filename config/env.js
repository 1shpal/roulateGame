var envJson = 
{
    "localhost": {
        "port": "1995",
        "baseUrl": "http://127.0.0.1:1995/",
        "siteName": "Bit Roul",
        "database": {
            "dbname": "ais_bitroul_dev",
            "username": "root",
            "password": "",
            "port": "",
            "host": "localhost"
        },
        "smtphost": "",
        "smtpport": 587,
        "supportEmail": "",
        "password": ""
    }, 
   
};

module.exports = () => {
    var env = process.env.Server || "localhost"; 

    return envJson[env];
}   