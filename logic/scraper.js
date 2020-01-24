const fs = require('fs')
const fetch = require('node-fetch')

var _object = {
  Scraper: function () {
    var apikey = ''
    var symbols = []
    var stocks = []
    var expStocks = []
    var lastFetch = new Date("2020-01-19")
    var today = new Date()

    this.writeToFile = function(symbol, data){
      var json = JSON.stringify(data);
      fs.writeFile("./data/" + symbol, json, function(err) {
          if(err) {
            console.log("Error in filewrite");
            console.log(err);
          }
          console.log(symbol + " written!");
      });
    }

    this.getStockDataOnline = async function () {
      var self = this
      const base = 'https://www.alphavantage.co/'
      noFinishedJobs = 0
      let p = new Promise(
          function(resolve, reject){
            var fiveMin = 1000 * 60 * 5;
            for (let i = 0; i < stocks.length; i++) {
              var past = new Date().getTime();

              let stocksymbol = stocks[i].getSymbol()
              const query = (functionName, symbol) => fetch(base + '/query?' + 'function=TIME_SERIES_DAILY&symbol=' + stocksymbol + '&outputsize=full&apikey=' + apikey)

              query('TIME_SERIES_MONTHLY', 'CMG')
                 .then(response => response.json())
                 .then(data => {
                   noFinishedJobs++
                   if (!data.hasOwnProperty("Time Series (Daily)")) {
                     if (data.hasOwnProperty("Note:")) {
                       console.log(data['Note:']);
                     }
                     console.log("ERROR");
                     resolve(true)
                     return
                   }
                   self.writeToFile(stocksymbol, data["Time Series (Daily)"])

                  if (i%5 == 0) {
                    console.log("i: " + i);
                    self.sleep(1000*65)
                  }
                  var isPast = (new Date().getTime() - past < fiveMin)?false:true;

                   if (noFinishedJobs == stocks.length) {
                     resolve(true)
                   }
                 })
            }
          }
      )
      return p
    }

    this.sleep = function (milliseconds) {
      var start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
          break;
        }
      }
    }

    this.readApiKey = function () {
      let p = new Promise(
        function(resolve, reject){
          fs.readFile('api.key', {encoding: 'utf-8'}, function (err, data) {
            if (!err) {
              apikey = data
              resolve(data)
            } else {
              console.log(err)
              reject(err)
            }
          })
        }
      )
      return p

    }

    this.readSymbols = async function () {
      let p = new Promise(
        function (resolve, reject) {
          fs.readFile('symbols', {encoding: 'utf-8'}, function (err, data) {
            if (!err) {
              symbols = data.split('\n')
              symbols.pop()
              for (var i = 0; i < symbols.length; i++) {
                stocks[stocks.length] = new Stock.Stock(symbols[i])
              }
              resolve(stocks)
              // Notify
            } else {
              console.log(err)
              reject("Ohno")
            }
          })
        }
      )
      return p
    }
  }
}

var s1 = new _object.Scraper()

let p1 = s1.readApiKey().then(function (done) {done})
let p2 = s1.readSymbols().then(function (done) {done})
await p1
await p2
let p3 = s1.getStockDataOnline() // Inclues writeToFile()
await p3
