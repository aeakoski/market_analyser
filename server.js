const fetch = require('node-fetch')
const fs = require('fs')
//const Brain = require('./logic/brain');
const Handler = require('./logic/handler');

const bodyParser = require('body-parser');
const express = require('express'); // Express
const routes = require('./server_routes'); //importing route
const app = express();

const html = __dirname + '/html';
const port = 4000;

app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(express.static(html)) // Static content
  .use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
  })


let handler = new Handler()

// var _Brain = new Brain.Brain()
// _Brain.initStrategies(this)

routes(app, handler)

app.listen(port, function () {
      console.log('Port: ' + port);
      console.log('Html: ' + html);
  }); // Start server
