var fs = require('fs')
const request = require('request');
const Portfolio = require('./portfolio');
const SMA = require('./strategies/SMA')
const WMA = require('./strategies/WMA')
const EMA = require('./strategies/EMA')

module.exports = class Handler {
  constructor(){
    this.strategiePortfolios = {}
    this.strategiePortfolios["SMA"] = new SMA("SMA", this, 10, 50)
    this.strategiePortfolios["WMA"] = new WMA("WMA", this, 10, 50)
    this.strategiePortfolios["EMA"] = new EMA("EMA", this, 10, 50)
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

  getPlotData(){
    // console.log("Serving plot data for " + portfolioName);
    let res = {}
    for(let name of Object.keys(this.strategiePortfolios)){
        res[name] = {}
        console.log("Get plot data loop: " + name);
        for (let symbol of this.strategiePortfolios[name].getSymbols()){
          res[name][symbol] = {
            regular:this.strategiePortfolios[name].getStockDataToPlot(symbol),
            _50:this.strategiePortfolios[name].calculateAverage(symbol, 10),
            _200:this.strategiePortfolios[name].calculateAverage(symbol, 50)
          }
        }
    }

    return res
  }


  getWishlist(portfolioName){ return this.strategiePortfolios[portfolioName].getSymbols() } // NEXT UP: NEED TO HAVE SYMBOLS LIST

  _newDay(){

    for(let portfolioName of Object.keys(this.strategiePortfolios)){
      console.log("Total Value of " + portfolioName + ": " + this.strategiePortfolios[portfolioName].balanceLeft);
      // Get the symbols
      let _symbols = this.strategiePortfolios[portfolioName].getSymbols()
      // Create request to the broker
      request({
        url: 'http://localhost:4001/newday',
        method: "POST",
        json: {symbols:_symbols}
      }, (err, res, q) => {
        if(Object.keys(q).length === 1){
          console.log("Weekend, nothing today");
          return
        }
        // Recieve broker data
        if (err) {
          console.log("Got error");
          console.log(err);
          return
        }

        let _this = this

        // Update portfolio with new qoutes
        this.strategiePortfolios[portfolioName].addNewQoute(q)

        // Calculate trends
        console.log("Calculating trend for: " + this.strategiePortfolios[portfolioName].name);
        let actions = this.strategiePortfolios[portfolioName].calculateTrends()

        // SELL
        this.strategiePortfolios[portfolioName].sell(actions.sell)

        // BUY
        this.strategiePortfolios[portfolioName].buy(actions.buy)

        // CURRENT VALUE
        console.log("Total Value of " + portfolioName + ": " + this.strategiePortfolios[portfolioName].getTotalValueToday(q));

      })
    }
  }
}
