const fs = require('fs')
const Stock = require('./stock');
const fetch = require('node-fetch')
var PlotlibPlot = require('nodeplotlib')


module.exports = {
  Brain: function () {
    var apikey = ''
    var symbols = []
    var stocks = []
    var expStocks = []

    this.print = function () {
        return "apikey: " + apikey
    }

    this.getStockData = async function () {
      // TODO Add promise
      const base = 'https://www.alphavantage.co/'
      noFinishedJobs = 0
      let p = new Promise(
          function(resolve, reject){
            for (let i = 0; i < stocks.length; i++) {
              let stocksymbol = stocks[i].getSymbol()
              const query = (functionName, symbol) => fetch(base + '/query?' + 'function=TIME_SERIES_DAILY&symbol=' + stocksymbol + '&outputsize=full&apikey=' + apikey)

              query('TIME_SERIES_MONTHLY', 'CMG')
                 .then(response => response.json())
                 .then(data => {
                   stocks[i].setQoutes(data["Time Series (Daily)"])
                   stocks[i].calculateHighLow()
                   stocks[i].calculateDerivative()
                   noFinishedJobs++
                   if (noFinishedJobs == stocks.length) {
                     resolve(true)
                   }
                 })
            }
          }
      )
      return p

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

    this.plot = function () {
      for (let i = 0; i < stocks.length; i++) {
        let real = {x: stocks[i].getDays(), y: stocks[i].getPrices(), type:'scatter'}
        let cax = {x: stocks[i].getDays(), y: stocks[i].getModel(), type:'scatter'}
        PlotlibPlot.plot([real, cax]);
      }
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
