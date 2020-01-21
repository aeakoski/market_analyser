const fetch = require('node-fetch')
const fs = require('fs')
const Brain = require('./brain');

async function main () {
  var _Brain = new Brain.Brain()
  _Brain.initStrategies()
  _Brain.saveAndQuit()
}

main()
