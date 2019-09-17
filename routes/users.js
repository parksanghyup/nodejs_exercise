var express = require('express')
var router = express.Router();
const mysql = require('mysql');

//AIzaSyDwPvj1Nl4FCjejZLQiEHQtsq-vovm5eAc
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'auth',
    port: 3306
});
conn.connect();

module.exports = function (passport) {
  var passport = require('passport');
  router.get('/kakao', passport.authenticate('kakao'));

  router.get('/kakao/callback',
      passport.authenticate('kakao', {
        failureRedirect: '/',
        successRedirect: '/'

      }));


  router.get('/', function (req, res, next) {
    res.send('respond with a resource');
  });

  router.get('/login', function (req, res, next) {
    res.render('login');
  })


  router.post('/login_process',
      passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true,
        successFlash: true,
        passReqToCallback: true
      }));


  router.get('/logout', function (request, response) {

    request.logout();
    // request.session.destroy(function(err){
    //   response.redirect('/');
    // })
    request.session.save(function () {
      response.redirect('/');
    })
  });


  router.get('/register', function (request, response) {
    response.render('register');
  })

  router.post('/id_check', function (request, response) {
      let data = request.body.id;
      console.log('입력데이터'+data);
      let sql = `select name from users where name= ?`;
        conn.query(sql,data,function (error, result) {
            console.log(result);
            if(result[0])
                response.send({check:'ok'});
            else
                response.send({check:'no'});
        });

  })




  router.post('/register_process',  function(request,response) {
    var sql = `INSERT INTO users (name, password) VALUES(?,?)`;
    console.log(request.body.email)

    conn.query(sql,[request.body.email,request.body.pwd], function(error, results) {
      if(error) {
        throw error;
      }
      response.redirect('/');
    })
  })


  return router
}

