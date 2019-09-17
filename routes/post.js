var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const requestIp = require('request-ip');
const ipaddr = require('ipaddr.js');
const fs = require('fs');
var path = '../upload';


var multer = require('multer');

var storage = multer.diskStorage({
  destination: function(request, file, callback) {
    callback(null, 'upload/')
  },
  filename: function(request, file, callback) {
    callback(null, file.originalname)
  }
})

var upload = multer({storage: storage})

router.use('/upload', express.static('upload'));


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
  connect.query(sql, function (error, results) {
    response.render('post_detail', { db: results });
  });
});



router.get('/create', function (request, response) {
  response.render('upload');
});

router.post('/create_process', upload.single('userfile'), function (request, response) {

  var title = request.body.title;
  var text = request.body.text;
  var author = request.user.name;
  if (!request.file){
    var file = '없음';
  } else {
    var file = request.file.path;
  }
  var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }
  console.log(ip);

  var sql = `INSERT INTO post (title, text, author, address, file) VALUES(?,?,?,?,?)`;
  connect.query(sql, [title, text, author, ip, file], function (error, results) {
    if (error) {
      throw error;
    } else {
      response.redirect('/');
    }
  })


router.get('/:id', function (request, response) {
  var sql = 'SELECT * FROM post where pk=?';
  connect.query(sql, [request.params.id], function (error, results) {
    if (error) {
      throw error;
    } else {
      var text = results[0].text;
      text = text.replace(/\r\n/gi, '<br>');
      var html = `
                  <h3>제목 : ${results[0].title}</h3>
                  <div>작성자 : ${results[0].author} | 아이피 : ${results[0].address} </div>
                  <div><a href="${results[0].file}"> 파일 : ${results[0].file}</a></div>
                  
                  <a href="/">홈</a>
                  `
                  
      if (request.user) {
        if (request.user.name === results[0].author) {
          html += `| <a href="/post/edit/${request.params.id}">수정</a> | <a href="/post/delete/${request.params.id}">삭제</a>`;

        }
      }

      response.send(html);
    }  
    
    
  });
});

  router.get('/edit/:id', function (request, response) {
    var sql = 'SELECT * FROM post where pk=?';

    connect.query(sql, [request.params.id], function (error, results) {
      if (error) {
        throw error;
      } else {
        let html = `
                     <h3>글 수정하기</h3>
                     <form action="/post/edit_process/${request.params.id}" method="POST">
                       <div cols="30"><input type="text" name="title" placeholder="제목" value="${results[0].title}">
                       </div>
                     <textarea name="text" cols="40" rows="20" wrap="hard" placeholder="내용">${results[0].text}</textarea>
                        <input type="submit" value="작성">
                     </form>
                        `;
        response.send(html);
      }
    });
  });

  router.post('/edit_process/:id', function (request, response) {
    var sql = 'UPDATE post SET title = ?, text = ? WHERE (pk=?);';
    connect.query(sql, [request.body.title, request.body.text, request.params.id], function (error, results) {
      if (error) {
        throw error;
      } else {
        response.redirect(`/post/${request.params.id}`);
      }

    });
  });
  router.get('/delete/:id', function (request, response) {
    var sql = `DELETE FROM post WHERE pk = ?;`
    connect.query(sql, request.params.id, function (error, results) {
      if (error) {
        throw error;
      } else {
        response.redirect('/');
      }
    })
  });
});

  router.get('/filelist', function(request, response) {
    fs.readdir('./upload', function(error, filelist) {
      console.log(filelist);
      response.render('filelist', {list: filelist});
    })
  })


module.exports = router;