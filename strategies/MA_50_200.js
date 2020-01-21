const fs = require('fs')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const fetch = require('node-fetch')

module.exports = {
  MA_50_200: function () {
    this.name = ""
    this.balanceLeft = 0
    this.risk = 0.1
    this.symbols_wishlist = []
    this.owns = []

    this.init = async function () {
      var _this = this
      let p = new Promise(
        function (resolve, reject) {
          fs.readFile('strategies/portfolio/MA_50_200.portf2', {encoding: 'utf-8'}, function (err, data) {
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

            for (let i = 0; i < data.owns.length; i++) {
              let _stocks = []
              for (let j = 0; j < data.owns[i].stocks.length; j++) {
                _stocks.push(
                  new Stock.Stock(
                    data.owns[i].symbol,
                    data.owns[i].stocks[j].boughtPrice,
                    data.owns[i].stocks[j].boughtDate)
                  )
              }
              _this.owns.push(new StockGroup.StockGroup(data.owns[i].symbol, _stocks))
            }
            resolve(true)
          })
        }
      )
      return p
    }

    this.writePortfolioToFile = function(){
      let main_json = {
        name : this.name,
        balanceLeft : this.balanceLeft,
        risk : this.risk,
        symbols_wishlist : this.symbols_wishlist,
        owns : this.owns
      }

      fs.writeFile("./strategies/portfolio/MA_50_200.portf3", JSON.stringify(main_json), function(err) {
          if(err) {
            console.log("Error in filewrite");
            console.log(err);
          }
          console.log("Written!");
      });
    }

    this.sellOrBuy = function(){}

    this.print = function(){
      console.log(this.name);
      for (let i = 0; i < this.owns.length; i++) {
        console.log(this.owns[i].symbol)
        for (let j = 0; j < this.owns[i].stocks.length; j++) {
          console.log(this.owns[i].stocks[j].boughtPrice)
        }
      }
    }
  }
}
