module.exports = class Strategy{
  constructor(name, portfolio, handler){
    this.Handler = handler
    this.portfolio = portfolio
    this.daysToOfferInView = 200
  }

  getStockDataToPlot(symbol){
    let res = []
    let dateList = Object.keys(this.portfolio.getStockData(symbol))
    dateList.sort()
    dateList.reverse()
    let counter
    for(let date of dateList){
      if (counter > this.daysToOfferInView) { break }
      res.push({
        date: date,
        value: this.portfolio.getStockData(symbol)[date]["4. close"]
      })
    }
    return res
  }
}
