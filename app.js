var express = require('express');
var app = express();
var router = require('./routes'); 

app.set('view engine', 'ejs');
app.use('/', router);
app.get('/home', function (req, res) {
    res.render('home');
});
app.listen(3000, function () {
    console.log('Servidor rodando na porta 3000');
});
