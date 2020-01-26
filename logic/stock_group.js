const Stock = require('./stock');


module.exports = {

  StockGroup: function (s, sl) {
    this.symbol = s
    this.stocks = sl
    this.positiveTrend = undefined
    this._50AVG = -1
    this._200AVG = -1

    this.getSymbol = function(){ return this.symbol }
    this.getOriginalValue = function(){ return 1337 }
    this.getNumOfStocks = function(){return 2}
    this.getAllowedToSell = function(){return 3}

  }
}
