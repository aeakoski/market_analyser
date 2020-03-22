const bodyParser = require('body-parser')
const fetch = require('node-fetch')
var menu = require('console-menu')
const express = require('express')
const request = require('request')
const fs = require('fs')

const app = express();

const html = __dirname + '/html'
const port = 4003

let keepOnGoing = true
function makeCall(){
  request('http://localhost:4000/api/newday', function (error, response, body) {
    if(JSON.parse(response.body).status === "OK"){
      if(keepOnGoing){
        makeCall()
      }
    } else {
      console.log(response);
      return
    }
  });
}

function displayMenu(){
  menu([
      { hotkey: '1', title: 'Start fast foreward', selected: true },
      { hotkey: '2', title: 'Stop fast foreward' },
      //{ separator: true },
      //{ hotkey: '?', title: 'Help' },
      ], {
      header: 'Fast foreward menu',
      border: true,
  }).then(function(item){
      if (item && item["hotkey"] === "1") {
          console.log('You chose: ' + JSON.stringify(item))
          // Set the infinite function
          keepOnGoing = true
          makeCall()

      } else if (item && item["hotkey"] === "2"){
          console.log('You chose: ' + JSON.stringify(item))
          // Stop the loop
          keepOnGoing = false
      } else {
          console.log('Menu closed.');
          return
      }
      displayMenu()
  });

}

app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use(express.static(html)) // Static content
  .use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
  })

app.listen(port, function () {
      console.log('Port: ' + port);
      console.log('Html: ' + html);
  }); // Start server

setTimeout(displayMenu, 500);
