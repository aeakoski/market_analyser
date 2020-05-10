const Portfolio = require("./portfolio.js")


module.exports = class Strategy extends Portfolio{
  constructor(name, handler, creationDate){
    super(name, handler, creationDate)
    this.daysToOfferInView = 200
  }

  getStockDataToPlot(){
    let d = {}
    for (let symbol of this.getSymbols()){
      d[symbol] = {}
      d[symbol].regular = this.getRegularStockDataToPlot(symbol)
      d[symbol].nr_owned = this.getNumberOfStock(symbol)

      if (this.shortTerm != undefined) {
        if (this.shortTerm === -1) {
          this.initLimits(symbol)
        }
        d[symbol]._50 = this.calculateAverage(symbol, this.shortTerm)
      }
      if (this.longTerm != undefined) {
        d[symbol]._200 = this.calculateAverage(symbol, this.longTerm)
      }
    }
    return d
  }

  getRegularStockDataToPlot(symbol){
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
      // console.log("In strategy Options:");
      // console.log({shortTerm: this.shortTerm, longTerm: this.longTerm});
      let decision = this.isABuy(symbol, {shortTerm: this.shortTerm, longTerm: this.longTerm})

      // let item = { symbol: symbol }
      // let list50 = this.calculateAverage(symbol, this.shortTerm, true)
      // let list200 = this.calculateAverage(symbol, this.longTerm, true)
      //
      // let shortTermAverage = list50[list50.length-1].value
      // let longTermAverage = list200[list200.length-1].value
      // let logObj = {
      //   shortTermAverage:shortTermAverage,
      //   longTermAverage:longTermAverage,
      //   symbol:symbol
      // }

      //this.logTrends(logObj) // THIS PRINTS TO SCREEN COMMENT ME OUT
      //if (shortTermAverage > longTermAverage) {
      if (decision.isABuy === "BUY") {
        // Buy
        res.buy.push(decision)
      } else if(decision.isABuy === "SELL") {
        // Sell
        res.sell.push(decision)
      }
    }
    // Sort res lists after relevance
    res.buy.sort((a, b) => (a.strength > b.strength) ? 1 : -1)
    res.sell.sort((a, b) => (a.strength > b.strength) ? 1 : -1)
    return res
  }

}
