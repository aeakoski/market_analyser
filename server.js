const fetch = require('node-fetch')
const fs = require('fs')

const base = 'https://www.alphavantage.co/'
var apikey

fs.readFile('api.key', {encoding: 'utf-8'}, function (err, data) {
  if (!err) {
    var apikey = data
  } else {
    console.log(err)
  }
})

fs.readFile('symbols', {encoding: 'utf-8'}, function (err, data) {
  if (!err) {
    console.log(data.split('\n'))
  } else {
    console.log(err)
  }
})

const query = (functionName, symbol, interval = '5min') => fetch(
    base + '/query?' + new URLSearchParams({ 'function': functionName, symbol, interval, apikey })
)

query('TIME_SERIES_MONTHLY', 'CMG')
    .then(response => response.json())
    .then(data => {
      // console.log(data)
    })
