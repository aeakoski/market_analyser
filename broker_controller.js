var fs = require('fs')
var moment = require('moment')
const request = require('request');

var dayCounter = 1
//var yesterday = moment('2016-03-01')

// UNIX Timestamp
//var clock_now = 1588333264 // 2020 04 30
var clock_now = 1584707650 // 2020 01 30
var interval = 900 // 15 minutes

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

exports.date = function(){
  //return yesterday.format("YYYY-MM-DD")
  return clock_now
}

function binarySearchWrapper(arr, i) {
  let _arr = arr.slice()
  _arr[0].isFirst = true
  _arr[arr.length-1].isLast = true
  return binarySearch(_arr, i)
}

function binarySearch(arr, i) {
    var mid = Math.floor(arr.length / 2);
    //console.log(arr[mid].date, i);

    if (arr[mid].date === i) {
        //console.log('match', arr[mid].date, i);
        //console.log("Good hit");
        return arr[mid];
    } else if (arr[mid].date < i && arr.length > 1) {
        //console.log('mid lower', arr[mid].date, i);
        return binarySearch(arr.splice(mid, Number.MAX_VALUE), i);
    } else if (arr[mid].date > i && arr.length > 1) {

        //console.log('mid higher', arr[mid].date, i);
        return binarySearch(arr.splice(0, mid), i);
    } else {
      //console.log("Bad hit");
        //console.log('not here, giving closest to', i);
        //console.log(arr[mid].date);
        if ((arr[mid].isFirst) || (arr[mid].isLast)){
          console.log(i);
          console.log(arr[mid]);
          return -1
        } else {
          return arr[mid];
        }
    }

}

exports.getBacklog = function(symbol, backlog){
  backlog = parseInt(backlog)
  return new Promise(function(resolve, reject){
    resObj = {}

    // let dateToFetch = moment(yesterday)
    // dateToFetch.subtract(1, "days")
    let dateToFetch = clock_now - interval

    let foundDates = 0
    if (fs.readdirSync('data/fx/').includes(symbol)) {
      all_qoutes = JSON.parse(fs.readFileSync("data/fx/" + symbol, options={encoding:"utf-8"}))
      all_qoutes.sort((a, b)=>{(a.date > b.date)?1:-1})
      let dayCounter = 0
      while(foundDates < backlog && dayCounter < 200){
        dateToFetch = dateToFetch - interval
        dayCounter++

        //resObj[dateToFetch] = all_qoutes[dateToFetch]
        let searchResult = binarySearchWrapper(all_qoutes, dateToFetch)
        if(searchResult !== -1){
          resObj[dateToFetch] = searchResult
        }

        foundDates = Object.keys(resObj).length

      }

      if (foundDates != backlog) {
        console.log(symbol + " stoped fetching at " + dateToFetch + ", total " + dayCounter + " days. Got " + foundDates + " days");
        // console.log();
        // throw "You requested fo fetch more qoutes than exist " + foundDates + " " + backlog
      }
      resolve(resObj)

    } else {
      reject("Could not find in cashed files " + symbol)
      console.log("Could not find in cashed files " + symbol);
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
      //stockObj.buyDate = yesterday.format("YYYY-MM-DD")
      stockObj.buyDate = clock_now
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
  clock_now = clock_now + interval
  //yesterday.add(1, "days")
}

exports.getTodaysQoutes = function(symbols){
  //console.log("Fetching qoutes for: " + yesterday.format("YYYY-MM-DD"));
  return new Promise(function(resolve, reject){
    //var requestDate = yesterday.format("YYYY-MM-DD")
    if( symbols === undefined ){return}
    var requestDate = clock_now

    todaysQoutes = {}
    // TODO Server craches if CANNOT GET
    for (let symbol of symbols) {
      if (fs.readdirSync('data/fx/').includes(symbol)) {
        all_qoutes = JSON.parse(fs.readFileSync("data/fx/" + symbol, options={encoding:"utf-8"}))

        //todaysQoutes[symbol] = all_qoutes[yesterday.format("YYYY-MM-DD")]
        let searchResult = binarySearchWrapper(all_qoutes, clock_now)
        if(searchResult !== -1){
          todaysQoutes[symbol] = searchResult
        }

        // todaysQoutes[symbol] = binarySearchWrapper(all_qoutes, clock_now)

      } else {
        console.log("Not cashed s file " + symbol);
      }
    }
    todaysQoutes.date = requestDate
    resolve(todaysQoutes)
    //return

  })
}
