var fs = require('fs')
var moment = require('moment')
const request = require('request');

var dayCounter = 1
var yesterday = moment('2016-03-01')

exports.pushTodaysQoutes = function(q){
  request({
    url: 'http://localhost:4000/api/newday',
    method: "POST",
    json: q
  }, (err, res, body) => {
    if (err) { return console.log(err) }
    // Send qoutes and dont expect an answer
  })

}

exports.getBacklog = function(symbol, backlog){
  return new Promise(function(resolve, reject){
    resObj = {}

    let dateToFetch = moment(yesterday)
    dateToFetch.subtract(1, "days")
    let foundDates = 0
    if (fs.readdirSync('./data').includes(symbol)) {
      all_qoutes = JSON.parse(fs.readFileSync("./data/" + symbol, options={encoding:"utf-8"}))
      if(symbol == "V"){
        console.log(all_qoutes);
      }
      let dayCounter = 0
      backlog = parseInt(backlog)

      while(foundDates < backlog && dayCounter<365 * 10){
        dateToFetch.subtract(1, 'days')
        dayCounter++
        if(all_qoutes[dateToFetch.format("YYYY-MM-DD")] == undefined){
          continue
        }
        foundDates++
        resObj[dateToFetch.format("YYYY-MM-DD")] = all_qoutes[dateToFetch.format("YYYY-MM-DD")]
        // if(foundDates == backlog){ break }
        now = dateToFetch
      }

      if (foundDates != backlog) {
        console.log(symbol + " stoped fetching at " + dateToFetch.format("YYYY-MM-DD") + ", total " + dayCounter + " days. Got " + foundDates + " days");
        // console.log();
        // throw "You requested fo fetch more qoutes than exist " + foundDates + " " + backlog
      }
      resolve(resObj)

    } else {
      reject("Need to implement API call for " + symbol)
      console.log("Need to implement API call for " + symbol);
    }
  })
}

exports.sell = async function(sellList){
  if (sellList.length == 0) {
    return { ackumulatedPrice: 0, returns:[] }
  }
  if (sellList == '') {
    return { ackumulatedPrice: 0, returns:[] }
  }
  returnsList = []
  // sellList.results [{symbol: "MSFT", id:203345453201}, {}, {}]
  console.log("Wants to sell the following");
  console.log(sellList);
  let returnPrice = 0
  let p = exports.getTodaysQoutes(sellList.results.map(x => x.symbol)).then(function(prices){
    for(let stock of sellList.results){
      if (prices[stock.symbol] === undefined) {
        returnsList.push(stock)
      } else {
        returnPrice = returnPrice + parseFloat(prices[stock.symbol]["close"])*0.99
      }
    }
  })
  await p
  return { ackumulatedPrice: returnPrice, returns:returnsList }
}


exports.buy = async function(buyList){
  let offerList = []
  console.log("Client wants to buy " + buyList.symbol);
  let p = exports.getTodaysQoutes([buyList.symbol]).then(function(prices){
    // Check for weekend
    if (Object.keys(prices).length === 1) {
      console.log("Weekend - No prices for " + buyList.symbol);
      return {results: offerList}
    }
    //console.log(prices);
    console.log("Price at: " + prices[buyList.symbol]['close']);
    let NUMBER_OF_STOCKS_TO_OFFER = 3
    for (let i = 0; i < NUMBER_OF_STOCKS_TO_OFFER; i++) {
      // Buy a stock
      let stockObj = {}
      stockObj.symbol = buyList.symbol
      // Get price
      stockObj.price = parseFloat(prices[buyList.symbol]["close"]) * 1.01
      // Get buydate
      stockObj.buyDate = yesterday.format("YYYY-MM-DD")
      // Get get ID
      stockObj.id = Math.floor(Math.random() * 1000000000000000)

      console.log("Making an offer:");
      console.log(stockObj);
      offerList.push(stockObj)
    }
    // console.log(offerList);
    // Offer the stock to the portfolio
  })
  await p
  return {results: offerList}
}

exports.incrementDate = function(){
  yesterday.add(1, "days")
}


exports.getTodaysQoutes = function(symbols, backlog){
  //console.log("Fetching qoutes for: " + yesterday.format("YYYY-MM-DD"));
  return new Promise(function(resolve, reject){
    var requestDate = yesterday.format("YYYY-MM-DD")
    if( symbols != undefined ){
      todaysQoutes = {}
      // TODO Server craches if CANNOT GET
      for (let symbol of symbols) {
        if (fs.readdirSync('./data').includes(symbol)) {
          all_qoutes = JSON.parse(fs.readFileSync("./data/" + symbol, options={encoding:"utf-8"}))
          if(all_qoutes[yesterday.format("YYYY-MM-DD")] === undefined){ continue }
          todaysQoutes[symbol] = all_qoutes[yesterday.format("YYYY-MM-DD")]
        } else {
          console.log("Need to implement API call for " + symbol);
        }
      }
      todaysQoutes.date = requestDate
      resolve(todaysQoutes)
      //return
    }
  })
}
