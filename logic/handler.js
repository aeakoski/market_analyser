var fs = require('fs')
const request = require('request');
const Portfolio = require('./portfolio');
const SMA = require('./strategies/SMA')
const WMA = require('./strategies/WMA')
const EMA = require('./strategies/EMA')

module.exports = class Handler {
  constructor(){
    // this.portfolio = new Portfolio(this)
    this.portfolios = {}
    this.portfolios["WMA-Portfolio"] = new Portfolio("WMA-Portfolio", this)
    this.portfolios["SMA-Portfolio"] = new Portfolio("SMA-Portfolio", this)
    this.portfolios["EMA-Portfolio"] = new Portfolio("EMA-Portfolio", this)
    this.strategies = []
    this.strategies.push(new SMA("SMA", this.portfolios["SMA-Portfolio"], this, 10, 50))
    this.strategies.push(new WMA("WMA", this.portfolios["WMA-Portfolio"], this, 10, 50))
    this.strategies.push(new EMA("EMA", this.portfolios["EMA-Portfolio"], this, 10, 50))
  }

  //debug(){ this.portfolio.debug()}

  status(){
    for (let i = 0; i < this.strategies.length; i++) {
      this.strategies[i].calculateTrends()
    }
  }

  requestQoutes(symbol, backlog){
    return new Promise(function(resolve, reject){
      // Contact broker
      console.log("Contacting: http://localhost:4001/backlog?symbol=" + symbol + '&days=' + backlog);
      request('http://localhost:4001/backlog?symbol=' + symbol + '&days=' + backlog, { json: true }, (err, res, body) => {
        if (err) {
          console.log(err);
          reject(err)
        } else {
          resolve(body)
        }
      })

    })
  }

  getPlotData(){
    // console.log("Serving plot data for " + portfolioName);
    let res = {}
    for(let strat of this.strategies){
        res[strat.name] = {}
        for (let symbol of this.portfolios[strat.name + "-Portfolio"].getSymbols()){
          res[strat.name][symbol] = {
            regular:strat.getStockDataToPlot(symbol),
            _50:strat.calculateAverage(symbol, 10),
            _200:strat.calculateAverage(symbol, 50)
          }
        }
    }

    return res
  }

  manageOffer(offer){
    // Have i reached the risk limit?

    // How many can i aford to buy
    console.log("I recieved the offer");
    console.log(offer);


    // Register trade


  }

  getWishlist(portfolioName){ return this.portfolios[portfolioName].getSymbols() } // NEXT UP: NEED TO HAVE SYMBOLS LIST

  _newDay(){
    for(let portfolioName of Object.keys(this.portfolios)){
      // Get the symbols
      let _symbols = this.portfolios[portfolioName].getSymbols()

      // Create request to the broker
      request({
        url: 'http://localhost:4001/newday',
        method: "POST",
        json: {symbols:_symbols}
      }, (err, res, q) => {
        // Recieve broker data
        if (err) {
          console.log("Got error");
          console.log(err);
          return
        }
        // Update portfolio with new qoutes
        console.log("Printing Q");
        console.log(q);
        for(let portfolioName of Object.keys(this.portfolios)){
          this.portfolios[portfolioName].addNewQoute(q)
        }

        // Calculate trends
        let _this = this
        for (let i = 0; i < this.strategies.length; i++) {
          let actions = this.strategies[i].calculateTrends()

          // SELL
          for (let symbolToSell of actions.sell){
            let stocksToSell = this.portfolios[portfolioName].getAndRemoveStocks(symbolToSell.symbol)
            request({
              url: 'http://localhost:4001/sell',
              method: "POST",
              json: {results: stocksToSell}
              },
              (err, res, q) => {
                if (err) { return console.log(err) }
                _this.portfolios[portfolioName].returnStocks(q.returns)
                _this.portfolios[portfolioName].addToBalance(q.ackumulatedPrice)
            })
          }

          // BUY
          for (let symbolToBuy of actions.buy){
            let moneyToSpend = this.portfolios[portfolioName].getMoneyLeft()
            request({
              url: 'http://localhost:4001/buy',
              method: "POST",
              json: {results: symbolToBuy}
              },
              (err, res, q) => {})
          }
        }
      })
    }
  }
}
