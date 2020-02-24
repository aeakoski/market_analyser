var fs = require('fs')
const request = require('request');

const Stock = require('./stock');
const StockGroup = require('./stock_group');

class Portfolio{
  constructor(name, handler){
    this.name = name
    this.Handler = handler
    // this.name
    // this.balanceLeft
    // this.symbols_wishlist
    // this.investedCapital
    // this.assetsInStocks
    // this.risk

    this.risk = 0.3

    var _this = this
    let p = new Promise(
      function (resolve, reject) {
        console.log();
        fs.readFile(__dirname + '/strategies/portfolio/MA_50_200.portf', {encoding: 'utf-8'}, function (err, data) {
          if (err) {
            console.log(err)
            reject("Ohno")
            return
          }
          data = JSON.parse(data)
          // _this.name = data.name
          _this.balanceLeft = data.balanceLeft
          _this.risk = data.risk
          _this.symbols_wishlist = data.symbols_wishlist
          let res = {}
          for (var i = 0; i < _this.symbols_wishlist.length; i++) {
            console.log("adding " + _this.symbols_wishlist[i]);
            res[_this.symbols_wishlist[i]] = new StockGroup.StockGroup(_this.symbols_wishlist[i], [])
          }
          _this.setStockGroup(res)
          _this.populateStockData()
          resolve(true)
        })
      }
    )
  }

  setStockGroup(sgObj){ this.stockGroup = sgObj }
  getPortfolioName(){ return this.name }
  getStockroup(){ return this.stockGroup }
  getMoneyLeft(){return this.balanceLeft}
  getAndRemoveStocks(symbol){
    let ret = this.stockGroup[symbol].stocks
    this.stockGroup[symbol].stocks = []
    return ret
  }
  returnStocks(stockList){
    // console.log("returnStocks");
    // console.log(stockList);
    for(let stock of stockList){

      this.stockGroup[stock.symbol].stocks.push(stock)
    }
  }
  addToBalance(money){this.balanceLeft = this.balanceLeft + money}
  getSymbols(){return this.symbols_wishlist}
  getSymbolsIOwn(){
    let symbolsIOwn = []
    for(let stockGroup of Object.keys(this.stockGroup)){
      if (this.stockGroup[stockGroup].stocks.length != 0) {
        symbolsIOwn.push(stockGroup)
      }
    }
    return symbolsIOwn
  }
  getStockData(symbol){return this.stockGroup[symbol].qoutes_400}
  getTotalValueToday(q){
    let totalValue = 0
    for(let symbol of this.getSymbolsIOwn()){
        totalValue = totalValue + (q[symbol]['4. close'])*this.stockGroup[symbol].stocks.length
    }
    return totalValue// + this.balanceLeft
  }
  getQoute(symbol, days){
      var _this = this
      return new Promise(function(resolve, reject){
        _this.Handler.requestQoutes(symbol, days).then(function(qoutes, err){
          if(err){ console.log("Connection error"); reject(err); return}
          let vals = []
          vals = qoutes
          resolve({symbol:symbol, values:vals})
        })
      })
    }
  debug(){
  }

  addNewQoute(q){
    for(let symbol of Object.keys(q)){
      if(symbol === "date"){continue}
      this.stockGroup[symbol].qoutes_400[q.date] = q[symbol]
    }
  }

  populateStockData(){
      var _this = this
      let waitinglist = []
      return new Promise(async function(resolve, reject){
        for (let symbol of Object.keys(_this.stockGroup)) {
          // Check for an earlier AVG. IF not exists, call for one
          if (_this.stockGroup[symbol].qoutes_400 == -1) {
            console.log("Fetching for: " + symbol);
            waitinglist.push(_this.getQoute(symbol, 400).then(async function(result, err){
              if (err){
                console.log("No connection to broker, restart Broker, then restart this app");
                reject(true)
              } // ConnectionError
              _this.stockGroup[result.symbol].qoutes_400 = result.values
              // for(let date of Object.keys(_this.stockGroup[result.symbol].qoutes_400)){
              //   _this.stockGroup[result.symbol].qoutes_400[date].value = _this.stockGroup[result.symbol].qoutes_400[date]["4. close"]
              // }

              console.log("First time data got for " + result.symbol + ". " + Object.keys(result.values).length + " datapoints.");
              }))
            }
          }

          for (let halt of waitinglist){
            await halt
          }
          resolve(true)
      })

    }

  addToWishList(symbol){
    const index = this.symbols_wishlist.indexOf(symbol.toUpperCase());
    if (index > -1) {
      console.log(this.symbols_wishlist)
      return false
    } else {
      this.symbols_wishlist.push(symbol.toUpperCase())
      console.log(this.symbols_wishlist)
      return true
    }
  }

  deleteFromWishList(symbol){
    console.log(symbol);
    const index = this.symbols_wishlist.indexOf(symbol.toUpperCase());
    if (index > -1) {
      this.symbols_wishlist.splice(index, 1);
      console.log(this.symbols_wishlist)
      return true
    }
    console.log(this.symbols_wishlist)
    return false
  }

  sell(sellList){
    if (sellList === []) {return}

    let _this = this
    let stocksToSell = []
    for (let symbolToSell of sellList){
      let stocks = this.getAndRemoveStocks(symbolToSell.symbol)
      stocksToSell = stocksToSell + stocks
    }

    request({
      url: 'http://localhost:4001/sell',
      method: "POST",
      json: {results: stocksToSell}
      },
      (err, res, q) => {
        console.log(q);
        if (err) { console.log(err); return }
        console.log("SELL RETURNS");
        _this.returnStocks(q.returns)
        _this.addToBalance(q.ackumulatedPrice)
    })
  }

  buy(buyList){
    let _this = this
    for (let symbolToBuy of buyList){
      let moneyToSpend = this.getMoneyLeft()
      request({
        url: 'http://localhost:4001/buy',
        method: "POST",
        json: {results: symbolToBuy}
        },
        (err, res, q) => {

          // Have i reached the risk limit?

          // Can I afford to take the offer?
          // If so, register trade
          for(let stock of q.results){
            if (_this.balanceLeft - stock.price >= 0) {
              _this.balanceLeft = _this.balanceLeft - stock.price
              //console.log("BUY RETURNS");
              _this.returnStocks([stock])
            }
          }
        })
    }
  }

  writePortfolioToFile(){
  //   let main_json = {
  //     name : this.name,
  //     balanceLeft : this.balanceLeft,
  //     risk : this.risk,
  //     symbols_wishlist : this.symbols_wishlist,
  //     owns : this.owns
  //   }
  }
}

module.exports = Portfolio
