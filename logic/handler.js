var fs = require('fs')
const request = require('request');
const Portfolio = require('./portfolio');
const SMA = require('./strategies/SMA')
const WMA = require('./strategies/WMA')
const EMA = require('./strategies/EMA')
const HOLD = require('./strategies/HOLD')

module.exports = class Handler {
  constructor(){
    this.strategiePortfolios = {}
    this.strategiePortfolios["SMA"] = new SMA("SMA", this, 10, 50)
    this.strategiePortfolios["WMA"] = new WMA("WMA", this, 10, 50)
    this.strategiePortfolios["EMA"] = new EMA("EMA", this, 10, 50)
    this.strategiePortfolios["HOLD"] = new HOLD("HOLD", this)
  }

  status(){
    for(let name of Object.keys(this.strategiePortfolios)){
      this.strategiePortfolios[name].calculateTrends()
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

  manageRestrictions(restrictions){
    console.log(restrictions);
    for (let strategy of Object.keys(this.strategiePortfolios)) {
      for (var symbol of Object.keys(restrictions)) {
        this.strategiePortfolios[strategy].stockGroup[symbol].allowedToBuy = restrictions[symbol].allowedToBuy
        this.strategiePortfolios[strategy].stockGroup[symbol].allowedToSell = restrictions[symbol].allowedToSell
        if(!(restrictions[symbol].allowedToBuy)){
          console.log("STOP ON " + symbol);
        }
      }
    }
  }

  compilePlotData(){
    let res = {}
    for(let portfolioName of Object.keys(this.strategiePortfolios)){
        res[portfolioName] = {}
        res[portfolioName]["stocks"] = {}
        res[portfolioName]["values"] = {}
        for (let symbol of this.strategiePortfolios[portfolioName].getSymbols()){
          res[portfolioName]["stocks"][symbol] = {
            regular:this.strategiePortfolios[portfolioName].getStockDataToPlot(symbol),
            _50:this.strategiePortfolios[portfolioName].calculateAverage(symbol, 10),
            _200:this.strategiePortfolios[portfolioName].calculateAverage(symbol, 50),
            nr_owned:this.strategiePortfolios[portfolioName].getNumberOfStock(symbol)
          }
        }
        // Insert portfolio values here
        res[portfolioName]["values"] = this.strategiePortfolios[portfolioName].getPortfolioValues()
    }
    return res
  }


  getWishlist(portfolioName){ return this.strategiePortfolios[portfolioName].getSymbols() } // NEXT UP: NEED TO HAVE SYMBOLS LIST

  async _newDay(){
    let _this = this
    for(let portfolioName of Object.keys(this.strategiePortfolios)){
      // Get the symbols
      let _symbols = this.strategiePortfolios[portfolioName].getSymbols()
      // Create request to the broker
      let pendingPortfolioCalculations = new Promise(async function(resolve, reject) {
        request({
          url: 'http://localhost:4001/newday',
          method: "POST",
          json: {symbols:_symbols}
        }, async (err, res, q) => {
          if(Object.keys(q).length == 1){
            console.log("Weekend, nothing today");
            resolve(true)
            return
          }
          // Recieve broker data
          if (err) {
            console.log("Got error");
            console.log(err);
            resolve(true)
            return
          }

          console.log(q.date);

          // Update portfolio with new qoutes
          _this.strategiePortfolios[portfolioName].addNewQoute(q)

          // Get desired actions
          // Calculate trends
          // console.log("Calculating trend for: " + _this.strategiePortfolios[portfolioName].name);
          // let actions = _this.strategiePortfolios[portfolioName].calculateTrends()
          let actions = _this.strategiePortfolios[portfolioName].getDesiredActions()

          // SELL
          // console.log("Selling");
          let sellPromise = _this.strategiePortfolios[portfolioName].sell(actions.sell)
          await sellPromise

          // BUY
          // console.log("Buying");
          let buyPromise = _this.strategiePortfolios[portfolioName].buy(actions.buy)
          await buyPromise

          // SAVE PORTFOLIOS CURRENT VALUE
          _this.strategiePortfolios[portfolioName].calculateTodaysTotalPortfolioValue(q)

          resolve(true)
        })
      });
      await pendingPortfolioCalculations
    }
    request({
      url: 'http://localhost:4001/incrementday',
      method: "GET",
      }, (err, res, q) => {}
    )
    return "OK"
  }
}
