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
          _this.name = data.name
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

getPortfolioName(){ return this.name }
setStockGroup(sgObj){ this.stockGroup = sgObj }
getStockroup(){ return this.stockGroup }
getSymbols(){return this.symbols_wishlist}
getStockData(symbol){return this.stockGroup[symbol].qoutes_400}
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
