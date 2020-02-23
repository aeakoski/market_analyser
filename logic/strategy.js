module.exports = class Strategy{
  constructor(name, portfolio, handler){
    this.name = name
    this.Handler = handler
    this.portfolio = portfolio
    this.daysToOfferInView = 200
  }

  getStockDataToPlot(symbol){
    let res = []
    let dateList = Object.keys(this.portfolio.getStockData(symbol))
    dateList.sort()
    dateList.reverse()
    let counter = 0
    for(let date of dateList){
      if (counter > this.daysToOfferInView) { break }
      res.push({
        date: date,
        value: this.portfolio.getStockData(symbol)[date]["4. close"]
      })
      counter++
    }
    return res
  }
  calculateTrends(){
    var _this = this
    let gettingQoutes = 0

    let res = {
      buy:[],
      sell:[]
    }

    for (let symbol of this.portfolio.getSymbols()) {
      console.log(symbol);
      let item = { symbol: symbol }
      let list50 = this.calculateAverage(symbol, this.shortTerm, true)
      let list200 = this.calculateAverage(symbol, this.longTerm, true)
      let shortTermAverage = list50[list50.length-1].value
      let longTermAverage = list200[list200.length-1].value
      if (shortTermAverage > longTermAverage) { // Buy
        //console.log("Trend - Percent " + (shortTermAverage.avg-longTermAverage.avg)/shortTermAverage.avg);
        console.log("Tred UP - BUY " + (shortTermAverage + ", " + longTermAverage));
        item.trendStrength = shortTermAverage - longTermAverage
        res.buy.push(item)
      } else { // Sell
        //console.log("Trend - Percent " + (longTermAverage.avg-shortTermAverage.avg)/longTermAverage.avg);
        console.log("Tred DOWN - SELL " + (longTermAverage + ", " + shortTermAverage));
        item.trendStrength = longTermAverage - shortTermAverage
        res.sell.push(item)
      }
      console.log(" ");
    }
    // Sort res lists after relevance
    res.buy.sort((a, b) => (a.trendStrength > b.trendStrength) ? 1 : -1)
    res.sell.sort((a, b) => (a.trendStrength > b.trendStrength) ? 1 : -1)
    return res
  }

}
