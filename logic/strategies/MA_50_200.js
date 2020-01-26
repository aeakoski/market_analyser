const fs = require('fs')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const fetch = require('node-fetch')

module.exports = {
  MA_50_200: function (b) {
    this.name = ""
    this.balanceLeft = 0
    this.risk = 0.1
    this.symbols_wishlist = []
    this.owns = {}
    this.Brain = b

    this.init = async function () {
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


            // for (let i = 0; i < data.owns.length; i++) {
            //   let _stocks = []
            //   for (let j = 0; j < data.owns[i].stocks.length; j++) {
            //     _stocks.push(
            //       new Stock.Stock(
            //         data.owns[i].symbol,
            //         data.owns[i].stocks[j].boughtPrice,
            //         data.owns[i].stocks[j].boughtDate
            //       )
            //     )
            //   }
            //   _this.owns.push(new StockGroup.StockGroup(data.owns[i].symbol, _stocks))
            // }
            resolve(true)
          })
        }
      )
      return p
    }

    this.stillOnWishList = function(){
      let iOwn = this.owns.map(x => x.symbol)
      return this.symbols_wishlist.filter(x => iOwn.indexOf(x) === -1)
    }

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

    var arrAvg = function(arr, new_value){
      arr.pop()
      arr.push(new_value)
      //console.log("new_value " + new_value);
      let sum = 0.0
      for(x of arr){
        sum = sum + parseFloat(x)
      }
      //console.log(sum + " / " + arr.length);
      //console.log(sum / arr.length);
      return {
        arr: arr,
        avg:(sum / arr.length)
      }
    }

    this.setSG = function(sgObj){
      this.owns = sgObj
    }

    this.calculateTrends = async function(q){
      // Check for an earlier AVG. IF not exists, call for one

      var _this = this
      let waitinglist = []
      //console.log("calculateTrends");
      //console.log(Object.keys(this.owns));

      //console.log(JSON.stringify(this.owns, null, 2));


      for (i of Object.keys(this.owns)) {
        //console.log(this.owns[i]._200AVG);
        if (this.owns[i]._50AVG == -1 || this.owns[i]._200AVG == -1) {
          waitinglist.push(this._getAVG(this.owns[i].symbol, 50).then(function(data){
            _this.owns[i]._50AVG = data
          }))
          waitinglist.push(this._getAVG(this.owns[i].symbol, 200).then(function(data){
            _this.owns[i]._200AVG = data
          }))
        }
      }

      for (let i = 0; i < waitinglist.length; i++) {
        await waitinglist[i]
      }

      //console.log("Trends");

      for (i of Object.keys(this.owns)) {
        // TODO Add todays qoute!
        // console.log(this.owns[i]._50AVG);
        let l200 = this.owns[i]._200AVG

        //console.log(this.owns[i].symbol);


        let _50 = arrAvg(this.owns[i]._50AVG, q[i]["4. close"])
        this.owns[i]._50AVG = _50.arr

        let _200 = arrAvg(this.owns[i]._200AVG,  q[i]["4. close"])
        this.owns[i]._200AVG = _200.arr

        //console.log(_50.avg);
        //console.log(_200.avg);
        if (_50.avg > _200.avg) {
          //console.log("Trend - Percent " + (_50.avg-_200.avg)/_50.avg);
          this.owns[i].trend = "UP"
          console.log("Tred UP - BUY " + (_50.avg - _200.avg));
        } else {
          //console.log("Trend - Percent " + (_200.avg-_50.avg)/_200.avg);
          this.owns[i].trend = "DOWN"
          console.log("Tred DOWN - SELL " + (_200.avg - _50.avg));
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
