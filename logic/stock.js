

module.exports = {

  Stock: function (s, p, d, id) {
    this.symbol = s
    this.boughtPrice = p
    this.boughtDate = d
    this.stockId = id

    this.getSymbol = function(){ return this.symbol }
    this.getboughtDate = function(){ return this.boughtDate }
    this.getBoughtPrice = function(){ return this.boughtPrice }
    this.getStockId = function(){ return this.stockId }
    
  }
}
