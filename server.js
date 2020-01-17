const fetch = require('node-fetch')
const fs = require('fs')
const Brain = require('./brain');


async function main () {
  var Brain1 = new Brain.Brain()

  let p1 = Brain1.readApiKey().then(function (done) {done})
  let p2 = Brain1.readSymbols().then(function (done) {done})
  await p1
  await p2

  Brain1.getStockData()


}

main()
