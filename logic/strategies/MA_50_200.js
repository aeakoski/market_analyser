const fs = require('fs')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const fetch = require('node-fetch')

module.exports = {
  MA_50_200: function (n, b) {
    this.name = n
    this.balanceLeft = 0
    this.risk = 0.1
    this.symbols_wishlist = []
    this.owns = {}
    this.Brain = b
    this.daysToOfferInView = 30

    this.initFromFile = async function () {
      var _this = this
      let p = new Promise(
        function (resolve, reject) {
          console.log();
          fs.readFile(__dirname + '/portfolio/MA_50_200.portf', {encoding: 'utf-8'}, function (err, data) {
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
            _this.setSG(res)
            resolve(true)
          })
        }
      )
      return p
    }

    this.initFromBroker = async function() {
      var _this = this

      let waitinglist = []
      for (let symbol of Object.keys(this.owns)) {
        // Check for an earlier AVG. IF not exists, call for one
        if (this.owns[symbol].qoutes_400 == -1) {
          console.log("Fetching for: " + symbol);
          waitinglist.push(this.getQoutes(symbol, 400).then(function(result, err){
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

    this.addToWishList = function(symbol){
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

    this.deleteFromWishList = function(symbol){
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

    this.getQoutes = function(symbol, days){
      var _this = this
      return new Promise(function(resolve, reject){
        _this.Brain.getQoutes(symbol, days).then(function(qoutes, err){
          if(err){ console.log("Connection error"); reject(err); return}
          let vals = []
          // if (days != Object.keys(qoutes).length) {
          //   console.log(days + " vs " + Object.keys(qoutes).length);
          //   throw "Broker is broken. Did not get enough days"
          // }
          vals = qoutes
          resolve({symbol:symbol, values:vals})
        })
      })
    }

    this._getAVG = function(symbol, days){
      var _this = this
      return new Promise(function(resolve, reject){
        _this.Brain.getQoutes(symbol, days).then(function(qoutes, err){
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

    var newArrAvg = function(_arr, newValue, date){
      let arrLatestVals = _arr[_arr.length-1].derivedFrom
      let arr = _arr
      arrLatestVals.shift()
      arrLatestVals.push(newValue)


      arr.shift()
      // console.log(arr[arr.length-1].value + ((new_value - arr[arr.length - 1].value) / (arr.length + 1)));
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
      //for (symbol of Object.keys(this.owns)){
        let aa = Object.keys(this.owns[symbol].qoutes_400).sort().reverse()
        for (let i = 0; i < this.daysToOfferInView; i++) {
          let avgList = []
          for (d of aa.slice(i, i+50)){
            avgList.push(parseFloat(this.owns[symbol].qoutes_400[d]["4. close"]))
          }
          this.owns[symbol]._50AVG.push({date: aa[i], value:arrAvg(avgList), derivedFrom: avgList})
        }
        this.owns[symbol]._50AVG.reverse()
      //}
    }

    this.calculate200Average = function(symbol){
      //for (symbol of Object.keys(this.owns)){
        let aa = Object.keys(this.owns[symbol].qoutes_400).sort().reverse()
        for (let i = 0; i < this.daysToOfferInView; i++) {
          let avgList = []
          for (d of aa.slice(i, i+200)){
            avgList.push(parseFloat(this.owns[symbol].qoutes_400[d]["4. close"]))
          }
          this.owns[symbol]._200AVG.push({date: aa[i], value:arrAvg(avgList), derivedFrom: avgList})
        }
        this.owns[symbol]._200AVG.reverse()
      //}
    }

    this.calculateTrends = async function(q){
      var _this = this
      let gettingQoutes = 0

      for (symbol of Object.keys(this.owns)) {

        // Add the new dates qoutes to the big collection of all stockgroups qoutes
        this.owns[symbol].qoutes_400[q.date] = q[symbol]

        // Update the AVG lists for the stockgroup

        if(q[symbol] == undefined){ continue }
        console.log(symbol);
        this.owns[symbol]._50AVG = newArrAvg(this.owns[symbol]._50AVG, q[symbol]["4. close"], q.date)
        this.owns[symbol]._200AVG = newArrAvg(this.owns[symbol]._200AVG,  q[symbol]["4. close"], q.date)

        //console.log(this.owns[i]._50AVG.map(x => x.value));

        let _50 = this.owns[symbol]._50AVG[this.owns[symbol]._50AVG.length - 1].value
        let _200 = this.owns[symbol]._200AVG[this.owns[symbol]._200AVG.length - 1].value
        if (_50 > _200) {
          //console.log("Trend - Percent " + (_50.avg-_200.avg)/_50.avg);
          this.owns[symbol].trend = "UP"
          console.log("Tred UP - BUY " + (_50 + ", " + _200));
        } else {
          //console.log("Trend - Percent " + (_200.avg-_50.avg)/_200.avg);
          this.owns[symbol].trend = "DOWN"
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
