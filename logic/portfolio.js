var fs = require('fs')
const request = require('request');

const Stock = require('./stock');
const StockGroup = require('./stock_group');

class Portfolio{
  constructor(name, handler){
    this.name = name
    this.Handler = handler
    this.dateValue = [] // [{date:xxxx-xx-xx, value:xxx.xx}, {{date:xxxx-xx-xx, value:xxx.xx}}...]
    this.portfolioValueOverTime = []
    this.totalValueOverTime = {}
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

  calculateTodaysTotalPortfolioValue(q){
    let _stocksValue = 0
    for(let symbol of this.getSymbolsIOwn()){
        _stocksValue = _stocksValue + (q[symbol]['4. close'])*this.stockGroup[symbol].stocks.length
    }
    this.totalValueOverTime[q.date] = {
      stocksValue: _stocksValue,
      totalValue: _stocksValue + this.balanceLeft,
      date: q.date
    }
  }

  getPortfolioValues(){
    return this.totalValueOverTime
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

  debug(){console.log("Called Portfolio.debug() not implemented yet");}


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

  async sell(sellList){
    if (sellList.length == 0) {return}

    let _this = this
    let stocksToSell = []
    for (let symbolToSell of sellList){
      let stocks = this.getAndRemoveStocks(symbolToSell.symbol)
      stocksToSell = stocksToSell.concat(stocks)
    }
    // console.log("Trying to sell:");
    // console.log(stocksToSell);

    return new Promise(function(resolve, reject) {
      request({
        url: 'http://localhost:4001/sell',
        method: "POST",
        json: {results: stocksToSell}
        },
        (err, res, q) => {
          if (err) { console.log(err); return }
          _this.returnStocks(q.returns)
          _this.addToBalance(q.ackumulatedPrice)
          resolve(true)
      })
    });
  }

  async askToBuyStock(symbolToBuy){
    let _this = this
    let buyAPIsettings = {
      url: 'http://localhost:4001/buy',
      method: "POST",
      json: {results: symbolToBuy}
      }
    return new Promise(function(resolve, reject) {
      request(buyAPIsettings,
        (err, res, q) => {
          // Have i reached the risk limit?

          // Can I afford to take the offer?

          // If so, register trade
          for(let stock of q.results){
            if (_this.balanceLeft - stock.price >= 0) {
              _this.balanceLeft = _this.balanceLeft - stock.price
              //console.log("BUY RETURNS");
              // console.log("Prowd owner of: ");
              // console.log(stock);
              _this.returnStocks([stock]) // Add stock object to portfolio
            }
          }
          resolve(true)
        })
    });
  }

  async buy(buyList){
    return new Promise(async (resolve, reject) => {
      let pendingTrades = []
      // Ask for an offer on all positive stocks
      for (let symbolToBuy of buyList){
        let moneyToSpend = this.getMoneyLeft()
        pendingTrades.push(this.askToBuyStock(symbolToBuy))
      }
      for(let pendingTrade of pendingTrades){
        await pendingTrade
      }
      resolve(true)
    });

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
