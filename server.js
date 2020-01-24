const fetch = require('node-fetch')
const fs = require('fs')
const Brain = require('./logic/brain');

const html = __dirname + '/html';
const port = 4000;
//const apiUrl = '/api';

// Express
const bodyParser = require('body-parser');
//const compression = require('compression'); // Why?
const express = require('express');
var routes = require('./server_routes'); //importing route

var app = express();

var latestAdded;
app
    //.use(compression()) // Why?
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // Static content
    .use(express.static(html))
    //.use('/admin', express.static(html));

    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next()
    })



/*
  //Dis dont work, i do no wy :( All req gets catched by dis!
    app.use(function(req, res) {
      res.status(404).send({url: req.originalUrl + ' not found MFS!'})
    });
*/

  var _Brain = new Brain.Brain()
  let init = _Brain.initStrategies(this)


  routes(app, _Brain)


    // Start server
  app.listen(port, function () {
        console.log('Port: ' + port);
        console.log('Html: ' + html);
    });


//
// async function main () {
//   var _Brain = new Brain.Brain()
//   let init = _Brain.initStrategies(this)
//   await init
//   //_Brain.saveAndQuit()
//   _Brain.newDay()
// }
//
// main()
