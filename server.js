const fetch = require('node-fetch')
const fs = require('fs')
const Brain = require('./brain');

async function main () {
  var _Brain = new Brain.Brain()
  let init = _Brain.initStrategies(this)
  await init
  //_Brain.saveAndQuit()
  _Brain.newDay()
}

main()
