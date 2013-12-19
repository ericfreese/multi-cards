var express = require('express'),
    app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.locals.basedir = __dirname + '/views';

// Express Middleware
app.use(express.logger('dev'));

// Static file hosting
app.use(express.static(__dirname + '/../static'));

app.get('/', function(req, res) { res.render('app'); });

module.exports = app;
