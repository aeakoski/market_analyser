const fs = require('fs')
const fetch = require('node-fetch')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class MA extends Strategy{
  constructor(name, portfolio, handler, shortTerm, longTerm){
    super(name, portfolio, handler)
    this.shortTerm = shortTerm
    this.longTerm = longTerm
  }

  arrAvg(arr){
    let sum = 0.0
    for(let x of arr){
      sum = sum + parseFloat(x)
    }
    return sum / arr.length
  }

  newArrAvg(_arr, newValue, date, averageOver){
    let arrLatestVals = _arr[_arr.length-1].derivedFrom
    let arr = _arr
    if (arrLatestVals.length >= averageOver) { arrLatestVals.shift() }
    if (arr.length >= this.daysToOfferInView) { arr.shift() }
    arrLatestVals.push(newValue)
    arr.push({
      date: date,
      value: this.arrAvg(arrLatestVals),
      derivedFrom: arrLatestVals
    })
    return arr
  }

  calculate50Average(symbol){
    let resList = []
    let stockData = this.portfolio.getStockData(symbol)
    let aa = Object.keys(stockData).sort().reverse()
    for (let i = 0; i < this.daysToOfferInView; i++) {
      let avgList = []
      for (let d of aa.slice(i, i+50)){
        avgList.push(parseFloat(stockData[d]["4. close"]))
      }
      resList.push({date: aa[i], value:this.arrAvg(avgList), derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }

  calculate200Average(symbol){
    let resList = []
    let stockData = this.portfolio.getStockData(symbol)
    let aa = Object.keys(stockData).sort().reverse()
    for (let i = 0; i < this.daysToOfferInView; i++) {
      let avgList = []
      for (let d of aa.slice(i, i+200)){
        avgList.push(parseFloat(stockData[d]["4. close"]))
      }
      resList.push({date: aa[i], value:this.arrAvg(avgList), derivedFrom: avgList})
    }
    resList.reverse()
    return resList
  }

  async calculateTrends(){
    var _this = this
    let gettingQoutes = 0
    for (let symbol of this.portfolio.getSymbols()) {
      console.log(symbol);
      // Update the AVG lists for the stockgroup
      let list50 = this.calculate50Average(symbol)
      let list200 = this.calculate200Average(symbol)

      let shortTermAverage = list50[list50.length-1].value
      let longTermAverage = list200[list200.length-1].value

      if (shortTermAverage > longTermAverage) {
        //console.log("Trend - Percent " + (shortTermAverage.avg-longTermAverage.avg)/shortTermAverage.avg);
        console.log("Tred UP - BUY " + (shortTermAverage + ", " + longTermAverage));
      } else {
        //console.log("Trend - Percent " + (longTermAverage.avg-shortTermAverage.avg)/longTermAverage.avg);
        console.log("Tred DOWN - SELL " + (longTermAverage + ", " + shortTermAverage));
      }
      console.log(" ");
    }
  }
}


//
// module.exports = {
//   MA_50_200: function (n, portfolio, handler) {
//     this.name = n
//     this.Handler = handler
//     this.portfolio = portfolio
//     this.daysToOfferInView = 200
//
//     this.getStockDataToPlot = function(symbol){
//       let res = []
//       let dateList = Object.keys(this.portfolio.getStockData(symbol))
//       dateList.sort()
//       dateList.reverse()
//       let counter
//       for(let date of dateList){
//         if (counter > this.daysToOfferInView) { break }
//         res.push({
//           date: date,
//           value: this.portfolio.getStockData(symbol)[date]["4. close"]
//         })
//       }
//       return res
//     }
//
//     var arrAvg = function(arr){
//       let sum = 0.0
//       for(x of arr){
//         sum = sum + parseFloat(x)
//       }
//       return sum / arr.length
//     }
//
//     this.newArrAvg = function(_arr, newValue, date, averageOver){
//       let arrLatestVals = _arr[_arr.length-1].derivedFrom
//       let arr = _arr
//       if (arrLatestVals.length >= averageOver) { arrLatestVals.shift() }
//       if (arr.length >= this.daysToOfferInView) { arr.shift() }
//       arrLatestVals.push(newValue)
//       arr.push({
//         date: date,
//         value: arrAvg(arrLatestVals),
//         derivedFrom: arrLatestVals
//       })
//       return arr
//     }
//
//     this.calculate50Average = function(symbol){
//       let resList = []
//       let stockData = this.portfolio.getStockData(symbol)
//       let aa = Object.keys(stockData).sort().reverse()
//       for (let i = 0; i < this.daysToOfferInView; i++) {
//         let avgList = []
//         for (d of aa.slice(i, i+50)){
//           avgList.push(parseFloat(stockData[d]["4. close"]))
//         }
//         resList.push({date: aa[i], value:arrAvg(avgList), derivedFrom: avgList})
//       }
//       resList.reverse()
//       return resList
//     }
//
//     this.calculate200Average = function(symbol){
//       let resList = []
//       let stockData = this.portfolio.getStockData(symbol)
//       let aa = Object.keys(stockData).sort().reverse()
//       for (let i = 0; i < this.daysToOfferInView; i++) {
//         let avgList = []
//         for (d of aa.slice(i, i+200)){
//           avgList.push(parseFloat(stockData[d]["4. close"]))
//         }
//         resList.push({date: aa[i], value:arrAvg(avgList), derivedFrom: avgList})
//       }
//       resList.reverse()
//       return resList
//     }
//
//     this.calculateTrends = async function(){
//       var _this = this
//       let gettingQoutes = 0
//       for (symbol of this.portfolio.getSymbols()) {
//         console.log(symbol);
//         // Update the AVG lists for the stockgroup
//         let list50 = this.calculate50Average(symbol)
//         let list200 = this.calculate200Average(symbol)
//
//         let _50 = list50[list50.length-1].value
//         let _200 = list200[list200.length-1].value
//
//         if (_50 > _200) {
//           //console.log("Trend - Percent " + (_50.avg-_200.avg)/_50.avg);
//           console.log("Tred UP - BUY " + (_50 + ", " + _200));
//         } else {
//           //console.log("Trend - Percent " + (_200.avg-_50.avg)/_200.avg);
//           console.log("Tred DOWN - SELL " + (_200 + ", " + _50));
//         }
//         console.log(" ");
//       }
//     }
//   }
// }
