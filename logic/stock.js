

module.exports = {

  Stock: function (s, p, d) {
    this.symbol = s
    this.boughtPrice = p
    this.boughtDate = d

    this.getSymbol = function(){ return this.symbol }
    this.getboughtDate = function(){ return this.boughtDate }
    this.getBoughtPrice = function(){ return this.boughtPrice }

  }
}
