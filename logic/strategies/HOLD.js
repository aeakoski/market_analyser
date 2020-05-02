const fs = require('fs')
const fetch = require('node-fetch')
const Stock = require('../stock');
const StockGroup = require('../stock_group');
const Strategy = require("../strategy.js")

module.exports = class HOLD extends Strategy{
  constructor(name, handler, creationDate){
    super(name, handler, creationDate)
  }

  isABuy(symbol, options){
      return {isABuy:true, strength:1, symbol:symbol}
  }


}
