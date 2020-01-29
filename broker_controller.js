var fs = require('fs')
var moment = require('moment')

const request = require('request');

    var dayCounter = 1
    //var yesterday = Date.parse('01 Jan 2008 00:00:00 GMT')
    //var yesterday = new Date('January 01, 2008 23:15:30');
    var yesterday = moment('2008-01-01')
    //moment().subtract(7, 'days');



    var formatDate = function(date){
      var d = new Date(date)
      var month = '' + (d.getMonth() + 1)
      var day = '' + d.getDate()
      var year = d.getFullYear()
      if (month.length < 2){
        month = '0' + month
      }
      if (day.length < 2){
        day = '0' + day
      }
      return [year, month, day].join('-')
    }

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
            if(foundDates == backlog){ break }
            now = dateToFetch
          }
          
          console.log("Left loop");

          console.log("Stoped at date " + dateToFetch.format("YYYY-MM-DD"));
          if (foundDates != backlog) { throw "You requested fo fetch more qoutes than exist " + foundDates + " " + backlog  }
          resolve(resObj)

        } else {
          reject("Need to implement API call for " + symbol)
          console.log("Need to implement API call for " + symbol);
        }
      })
    }

    exports.getTodaysQoutes = function(symbol, backlog){
      return new Promise(function(resolve, reject){
        //yesterday.setDate(dayCounter);
        //console.log(formatDate(yesterday));
        console.log("Fetching qoutes for: " + yesterday.format("YYYY-MM-DD"));
        var requestDate = yesterday.format("YYYY-MM-DD")
        request('http://localhost:4000/api/wishlist', { json: true }, (err, res, body) => {
          if (err) { return console.log(err) }
          // Get stock info for todays date
          //console.log("Wishlist: " + Object.keys(body))
          if (body.wishlist === undefined){
            console.log("Body of Wishlist Undefined. Get failed");
            return
          }
          todaysQoutes = {}
          // TODO Server craches if CANNOT GET
          //console.log(body.wishlist);
          for (let i = 0; i < body.wishlist.length; i++) {
            if (fs.readdirSync('./data').includes(body.wishlist[i])) {
              all_qoutes = JSON.parse(fs.readFileSync("./data/" + body.wishlist[i], options={encoding:"utf-8"}))
              //if(all_qoutes[formatDate(yesterday)] === undefined){ continue }
              if(all_qoutes[yesterday.format("YYYY-MM-DD")] === undefined){ continue }
              //todaysQoutes[body.wishlist[i]] = all_qoutes[formatDate(yesterday)]
              todaysQoutes[body.wishlist[i]] = all_qoutes[yesterday.format("YYYY-MM-DD")]
            } else {
              console.log("Need to implement API call for " + body.wishlist[i]);
            }
          }
          console.log("Todays qoutes is");
          todaysQoutes.date = requestDate
          console.log(JSON.stringify(todaysQoutes, null, 2));
          resolve(todaysQoutes)
        })
        // yesterday = today
        //dayCounter ++
        yesterday.add(1, "days")
      })
    }
