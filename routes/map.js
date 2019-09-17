var express = require('express');
var router = express.Router();
const mysql = require('mysql');


var connect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'auth',
    port: 3306
});
connect.connect();


router.get('', function (request, response) {
    response.render('map');

});



module.exports = router;