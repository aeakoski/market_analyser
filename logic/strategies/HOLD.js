const fs = require('fs')
const fetch = require('node-fetch')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class HOLD extends Strategy{
  constructor(name, handler){
    super(name, handler)
    this.shortTerm = 2
    this.longTerm = 1
  }

  calculateAverage(symbol, n){
    return [{value:n}]
  }

}
