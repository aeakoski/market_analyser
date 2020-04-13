const Portfolio = require("./portfolio.js")


module.exports = class Strategy extends Portfolio{
  constructor(name, handler){
    super(name, handler)
    this.daysToOfferInView = 200
  }

  getStockDataToPlot(symbol){
    let res = []
    let dateList = Object.keys(this.getStockData(symbol))
    dateList.sort()
    dateList.reverse()
    let counter = 0
    for(let date of dateList){
      if (counter > this.daysToOfferInView) { break }
      res.push({
        date: date,
        value: this.getStockData(symbol)[date]["close"]
      })
      counter++
    }
    return res
  }

  logTrends(tendObj){
    if (tendObj.shortTermAverage > tendObj.longTermAverage) {
      console.log(tendObj.symbol + " - BUY " + (tendObj.shortTermAverage + ", " + tendObj.longTermAverage));
    }else{
      console.log(tendObj.symbol + " - SELL " + (tendObj.longTermAverage + ", " + tendObj.shortTermAverage));
    }
        console.log(" ");
  }

  getDesiredActions(){
    var _this = this
    let gettingQoutes = 0

    let res = {
      buy:[],
      sell:[]
    }

    for (let symbol of this.getSymbols()) {
      let item = { symbol: symbol }
      let list50 = this.calculateAverage(symbol, this.shortTerm, true)
      let list200 = this.calculateAverage(symbol, this.longTerm, true)

      let shortTermAverage = list50[list50.length-1].value
      let longTermAverage = list200[list200.length-1].value
      let logObj = {
        shortTermAverage:shortTermAverage,
        longTermAverage:longTermAverage,
        symbol:symbol
      }
      //this.logTrends(logObj) // THIS PRINTS TO SCREEN COMMENT ME OUT
      if (shortTermAverage > longTermAverage) {
        // Buy
        item.trendStrength = shortTermAverage - longTermAverage
        res.buy.push(item)
      } else {
        // Sell
        item.trendStrength = longTermAverage - shortTermAverage
        res.sell.push(item)
      }
    }
    // Sort res lists after relevance
    res.buy.sort((a, b) => (a.trendStrength > b.trendStrength) ? 1 : -1)
    res.sell.sort((a, b) => (a.trendStrength > b.trendStrength) ? 1 : -1)
    return res
  }

}
