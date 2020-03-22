const fs = require('fs')
const express = require('express')
const fetch = require('node-fetch')
var routes = require('./broker_routes')
const bodyParser = require('body-parser')

const html = __dirname + '/html';
const port = 4001;


var app = express();
app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // Static content
    .use(express.static(html))

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
  routes(app)

    // Start server
  app.listen(port, function () {
        console.log('Port: ' + port);
        console.log('Html: ' + html);
    });
