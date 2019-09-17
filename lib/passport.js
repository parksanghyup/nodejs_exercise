var mysql = require('mysql');
var passport = require('passport'),
LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;


var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'auth',
    port: 3306
});
conn.connect();

var results = [];

module.exports = function (app) {


    function passport_process(info, done) {
        
    }
  


    var session = require('express-session');


    var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy;
    var flash = require('connect-flash')

    app.use(flash());
    app.use(session({
        cookie: { maxAge: 60000 },
        secret: 'woot',
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
        console.log(user);
        console.log('serial');
        done(null, user[0].name);
    });

    passport.deserializeUser(function (user, done) {
        console.log('deserial');
        conn.query(`SELECT * FROM users where name = ?`, [user], function (err, results) {
            console.log(results[0]);
            done(err, results[0]);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password',
    },
        function (username, password, done) {
            conn.query(`SELECT * FROM users where name = ? ;`, [username], function (error, _results) {
                if (error) {
                    return done(error);
                } else {
                    if (username === _results[0].name) {
                        if (password === _results[0].password) {
                            console.log(`쿼리에서 : ${_results}`);
                            return done(null, _results);
                        } else {
                            return done(null, false);
                        }
                    } else {
                        return done(null, false);
                    }
                }

            });
        }
    ));

    passport.use(new KakaoStrategy( {
        clientID : '5d62248f2c44b4a831a56ed2b81bba5e',
        clientSecret : 'KV7d18IEWhrn1yTVcCbVJRLTrjViOaYC',
        callbackURL : 'http://localhost:8000/users/kakao/callback',
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile.username);       

        var confrm_sql = `select * from users where password=?`;
        conn.query(confrm_sql, profile.id, function(err, result) {
            if (err) {
                return done(err);
            } else {
                if (result.length == 0 ) {
                    var signup_sql = `INSERT INTO users (name, password) VALUES(?,?)`;
                    conn.query(signup_sql,[profile.username, profile.id], function(err, result){
                        if(err) {
                            return done(err);
                        } else {
                            return done(null, {
                                'id':profile.id,
                                'name':profile.username,                                
                            });
                            
                        }
                    });
                } else {
                    console.log('이미있는 아이디');
                    return done(null, result);
                    };
                }
            
        })
        
    })
    )

}


