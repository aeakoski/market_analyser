const fs = require('fs')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const fetch = require('node-fetch')

module.exports = {
  MA_50_200: function (n, portfolio, handler) {
    this.name = n
    // this.balanceLeft = 0
    // this.symbols_wishlist = []
    this.owns = {}
    this.Handler = handler
    this.portfolio = portfolio
    this.daysToOfferInView = 200

    // this.initFromFile = async function () {
    //   var _this = this
    //   let p = new Promise(
    //     function (resolve, reject) {
    //       console.log();
    //       fs.readFile(__dirname + '/portfolio/MA_50_200.portf', {encoding: 'utf-8'}, function (err, data) {
    //         if (err) {
    //           console.log(err)
    //           reject("Ohno")
    //           return
    //         }
    //         data = JSON.parse(data)
    //         _this.name = data.name
    //
    //         _this.balanceLeft = data.balanceLeft
    //         _this.risk = data.risk
    //         _this.symbols_wishlist = data.symbols_wishlist
    //         let res = {}
    //         for (var i = 0; i < _this.symbols_wishlist.length; i++) {
    //           console.log("adding " + _this.symbols_wishlist[i]);
    //           res[_this.symbols_wishlist[i]] = new StockGroup.StockGroup(_this.symbols_wishlist[i], [])
    //
    //         }
    //         _this.setSG(res)
    //         resolve(true)
    //       })
    //     }
    //   )
    //   return p
    // }

    this.initFromBroker = async function() {
      var _this = this
      let waitinglist = []
      return new Promise(async function(resolve, reject){
        for (let symbol of Object.keys(this.owns)) {
          // Check for an earlier AVG. IF not exists, call for one
          if (this.owns[symbol].qoutes_400 == -1) {
            console.log("Fetching for: " + symbol);
            waitinglist.push(this.getQoutes(symbol, 400).then(async function(result, err){
              if (err){
                console.log("No connection to broker, restart Broker, then restart this app");
                return
              } // ConnectionError
              //gettingQoutes = this.getQoutes(this.owns[i].symbol, 400).then(function(symbol, data){
              _this.owns[result.symbol].qoutes_400 = result.values
              console.log("First time data got for " + result.symbol + ". " + Object.keys(result.values).length + " datapoints.");
              _this.calculate50Average(result.symbol)
              _this.calculate200Average(result.symbol)
              //console.log(symbol + " " + Object.keys(_this.owns[symbol].qoutes_400).length + " qoutes");
              }))

            }
          }

          for (halt of waitinglist){
            await halt
          }
          resolve(true)
      })

    }

    this.stillOnWishList = function(){
      let iOwn = this.owns.map(x => x.symbol)
      return this.symbols_wishlist.filter(x => iOwn.indexOf(x) === -1)
    }

    this.getRegularQoutes = function(symbol){
      let arr = []
      let dates = Object.keys(this.owns[symbol].qoutes_400).sort().reverse().slice(0,this.daysToOfferInView)

      for(_date of dates){
        let val
        if (this.owns[symbol].qoutes_400[_date] == undefined) {
          val = 0
        } else {
          val = parseFloat(this.owns[symbol].qoutes_400[_date]["4. close"])
        }

          arr.push({
            date: _date,
            value: val
          })
      }
      return arr
    }

    this.get50Qoutes = function(s){return this.owns[s]._50AVG}
    this.get200Qoutes = function(s){return this.owns[s]._200AVG}

    // this.addToWishList = function(symbol){
    //   const index = this.symbols_wishlist.indexOf(symbol.toUpperCase());
    //   if (index > -1) {
    //     console.log(this.symbols_wishlist)
    //     return false
    //   } else {
    //     this.symbols_wishlist.push(symbol.toUpperCase())
    //     console.log(this.symbols_wishlist)
    //     return true
    //   }
    // }

    // this.deleteFromWishList = function(symbol){
    //   console.log(symbol);
    //   const index = this.symbols_wishlist.indexOf(symbol.toUpperCase());
    //   if (index > -1) {
    //     this.symbols_wishlist.splice(index, 1);
    //     console.log(this.symbols_wishlist)
    //     return true
    //   }
    //   console.log(this.symbols_wishlist)
    //   return false
    // }

    // this.writePortfolioToFile = function(){
    //   let main_json = {
    //     name : this.name,
    //     balanceLeft : this.balanceLeft,
    //     risk : this.risk,
    //     symbols_wishlist : this.symbols_wishlist,
    //     owns : this.owns
    //   }
    //
    //   fs.writeFile("./strategies/portfolio/MA_50_200.portf3", JSON.stringify(main_json), function(err) {
    //       if(err) {
    //         console.log("Error in filewrite");
    //         console.log(err);
    //       }
    //       console.log("Written!");
    //   });
    // }
    //
    // this.getQoutes = function(symbol, days){
    //   var _this = this
    //   return new Promise(function(resolve, reject){
    //     _this.Brain.getQoutes(symbol, days).then(function(qoutes, err){
    //       if(err){ console.log("Connection error"); reject(err); return}
    //       let vals = []
    //       vals = qoutes
    //       resolve({symbol:symbol, values:vals})
    //     })
    //   })
    // }

    this._getAVG = function(symbol, days){
      var _this = this
      return new Promise(function(resolve, reject){
        _this.Handler.getQoutes(symbol, days).then(function(qoutes, err){
          let vals = []
          if (days != Object.keys(qoutes).length) {
            console.log(days + " vs " + Object.keys(qoutes).length);
            throw "Broker is broken. Did not get enough days"
          }
          for (var i = 0; i < Object.keys(qoutes).length; i++) {
            vals.push(parseFloat(qoutes[Object.keys(qoutes)[i]]["4. close"]))
          }
          resolve(vals)
        })
      })
    }
    var arrAvg = function(arr){
      let sum = 0.0
      for(x of arr){
        sum = sum + parseFloat(x)
      }
      //console.log(sum + " / " + arr.length);
      //console.log(sum / arr.length);
      return sum / arr.length
    }

    this.newArrAvg = function(_arr, newValue, date, averageOver){
      let arrLatestVals = _arr[_arr.length-1].derivedFrom
      let arr = _arr
      if (arrLatestVals.length >= averageOver) { arrLatestVals.shift() }
      if (arr.length >= this.daysToOfferInView) { arr.shift() }
      arrLatestVals.push(newValue)
      arr.push({
        date: date,
        value: arrAvg(arrLatestVals),
        derivedFrom: arrLatestVals
      })
      return arr
    }

    this.setSG = function(sgObj){
      this.owns = sgObj
    }

    this.calculate50Average = function(symbol){
      let resList = []
      let stockData = this.portfolio.getStockData(symbol)
      let aa = Object.keys(stockData).sort().reverse()
      for (let i = 0; i < this.daysToOfferInView; i++) {
        let avgList = []
        for (d of aa.slice(i, i+50)){
          avgList.push(parseFloat(stockData[d]["4. close"]))
        }
        resList.push({date: aa[i], value:arrAvg(avgList), derivedFrom: avgList})
      }
      resList.reverse()
      return resList
    }

    this.calculate200Average = function(symbol){
      let resList = []
      let stockData = this.portfolio.getStockData(symbol)
      let aa = Object.keys(stockData).sort().reverse()
      for (let i = 0; i < this.daysToOfferInView; i++) {
        let avgList = []
        for (d of aa.slice(i, i+200)){
          avgList.push(parseFloat(stockData[d]["4. close"]))
        }
        resList.push({date: aa[i], value:arrAvg(avgList), derivedFrom: avgList})
      }
      resList.reverse()
      return resList
    }

    this.calculateTrends = async function(){
      var _this = this
      let gettingQoutes = 0
      for (symbol of this.portfolio.getSymbols()) {
        console.log(symbol);
        // Update the AVG lists for the stockgroup
        let list50 = this.calculate50Average(symbol)
        let list200 = this.calculate200Average(symbol)

        let _50 = list50[list50.length-1].value
        let _200 = list200[list200.length-1].value

        if (_50 > _200) {
          //console.log("Trend - Percent " + (_50.avg-_200.avg)/_50.avg);
          console.log("Tred UP - BUY " + (_50 + ", " + _200));
        } else {
          //console.log("Trend - Percent " + (_200.avg-_50.avg)/_200.avg);
          console.log("Tred DOWN - SELL " + (_200 + ", " + _50));
        }
        console.log(" ");
      }
  }

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
