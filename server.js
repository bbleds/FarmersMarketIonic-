var express = require('express');
var proxy = require('express-http-proxy');

app = express();
app.use(express.static('www'));
app.use('/api', proxy('https://maps.googleapis.com', {
  filter: function(req, res) {
     return req.method == 'GET';
  },
  forwardPath: function(req, res) {
    return require('url').parse(req.url).path;
  }
}));


app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});