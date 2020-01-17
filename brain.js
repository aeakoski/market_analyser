const fs = require('fs')
const Stock = require('./stock');
const fetch = require('node-fetch')



module.exports = {
  Brain: function () {
    var apikey = ''
    var symbols = []
    var stocks = []

    this.print = function () {
        return "apikey: " + apikey
    }

    this.getStockData = function () {
      // TODO Add promise
      const base = 'https://www.alphavantage.co/'

      for (let i = 0; i < stocks.length; i++) {
        let stocksymbol = stocks[i].getSymbol()
        const query = (functionName, symbol) => fetch(base + '/query?' + 'function=TIME_SERIES_DAILY&symbol=' + stocksymbol + '&apikey=' + apikey)

        query('TIME_SERIES_MONTHLY', 'CMG')
           .then(response => response.json())
           .then(data => {
             stocks[i].setQoutes(data["Time Series (Daily)"])
             stocks[i].calculateHighLow()
           })
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
