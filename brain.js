const MA_50_200 = require('./strategies/MA_50_200')


module.exports = {
  Brain: function () {
    this.strategies = []

    this.initStrategies = async function(){
      let _MA_50_200_1 = new MA_50_200.MA_50_200()
      let p = _MA_50_200_1.init()
      await p
    }

    this.newDay = function(){}

    this.saveAndQuit = function(){
      for (let i = 0; i < this.strategies.length; i++) {
        this.strategies[i].writePortfolioToFile()
      }
    }
  }
}
