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


router.get('/', function (request, response) { 

  var sql = `SELECT * FROM post;`;
  connect.query(sql, function(error, results) {
    
    if(request.user) {
      response.render('index', {user: request.user.name, db: results});
    } else {
      response.render('index',{db: results});
    }    
    
  }); 
});



router.get('/upload', function(request,response) {
  response.render('upload');
});

module.exports = router;