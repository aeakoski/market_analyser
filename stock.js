// import regression from 'regression';
const regression = require('regression')


module.exports = {

  Stock: function (s) {
    this.symbol = s
    this.qoutes = {}
    this.thirtyHigh = 0
    this.thirtyLow = 999999999999999999999
    this.prices = []
    this.model = []
    this.days = []

    this.setQoutes = function (q) { this.qoutes = q }

    this.getSymbol = function(){ return this.symbol }
    this.getPrices = function(){ return this.prices}
    this.getDays = function(){ return this.days }
    this.getModel = function(){ return this.model }

    this.calculateHighLow = function () {
      var now = new Date()
      for (let i = 0; i <= 30; i++ ) {
        var date_ = new Date().setDate(now.getDate() - i)
        let fd = this.formatDate(date_)
        if (!this.qoutes.hasOwnProperty(fd)){
          continue
        }

        if (this.thirtyHigh < parseFloat(this.qoutes[fd]["2. high"])) {
          this.thirtyHigh = parseFloat(this.qoutes[fd]["2. high"])
        }
        if (this.thirtyLow > parseFloat(this.qoutes[fd]["3. low"])) {
          this.thirtyLow = parseFloat(this.qoutes[fd]["3. low"])
        }
      }

      console.log(this.symbol);
      console.log(this.thirtyHigh);
      console.log(this.thirtyLow);
    }


    this.calculateDerivative = function () {
      var now = new Date()
      let stockData = []
      let x = []
      let y = []
      timeWindow = 365 * 5
      for (let i = 0; i <= timeWindow; i++ ) {
        var date_ = new Date().setDate(now.getDate() - i)
        let fd = this.formatDate(date_)
        if (this.qoutes[fd] === undefined){
          continue
        }
        x.push(timeWindow - i)
        y.push(parseFloat(this.qoutes[fd]["2. high"]))
        stockData.push([timeWindow - i, parseFloat(this.qoutes[fd]["2. high"])])
      }

      const result = regression.exponential(stockData, {precision:10})
      const derivative = result.equation[0]*result.equation[1]*Math.pow(2.71828, 30 * result.equation[1])

      console.log(result.string);
      console.log("R2 = " + result.r2);
      console.log("Derivative today: " + derivative);
      console.log("");

      this.days = x
      this.prices = y
      this.model = x.map(_x => result.equation[0]*2.71828**(_x*result.equation[1]))
    }

    this.formatDate = function (date) {
      var d = new Date(date)
      var month = '' + (d.getMonth() + 1)
      var day = '' + d.getDate()
      var year = d.getFullYear()

      if (month.length < 2) {
        month = '0' + month
      }
      if (day.length < 2) {
        day = '0' + day
      }
      return [year, month, day].join('-')
    }

  }
}
