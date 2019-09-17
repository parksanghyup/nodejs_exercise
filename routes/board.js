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


router.get('/:page', function (request, response, next) {

    let page = request.params.page;
    let rows = [];
    let data = 'ㅗㅇ';
    var sql = `
                select title, @rownum:= @rownum+1 AS RNUM from post , (select @rownum:=0) AS RNUM;`;

    connect.query(sql, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            console.log(result.length - 1);
            let list_num = 10;
            let page_length = (result.length - 1) / list_num;
            if (result.length - 1 % list_num) page_length += 1;

            if(page <1) { page = 1;  }
            if(page > page_length) { page = parseInt(page_length); }
            console.log('페이지'+page);
            for(let i=((page-1)*10);i<(page)*10;i++) {

                i = String(i);
                if(result[i]===undefined)
                  break;
                rows.push(result[i]);
            }
            page = parseInt(page)
            console.log('페이지2'+page);
            response.render('board', {row: rows, page: page, length: page_length, list_num: list_num});
        }
    })
});

module.exports = router;