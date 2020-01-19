// import regression from 'regression';
const regression = require('regression');
module.exports = {

  Stock: function (s) {
    var symbol = s
    var qoutes = {}
    var thirtyHigh = 0
    var thirtyLow = 999999999999999999999

    this.setQoutes = function (q) {
      qoutes = q
    }
    this.getSymbol = function(){
      return symbol
    }

    this.calculateHighLow = function () {
      console.log("Qoutes length: " + Object.keys(qoutes).length)
      var now = new Date()
      for (let i = 0; i <= 30; i++ ) {
        var date_ = new Date().setDate(now.getDate() - i)
        let fd = this.formatDate(date_)
        if (qoutes[fd] === undefined){
          continue
        }

        if (thirtyHigh < parseFloat(qoutes[fd]["2. high"])) {
          thirtyHigh = parseFloat(qoutes[fd]["2. high"])
        }
        if (thirtyLow > parseFloat(qoutes[fd]["3. low"])) {
          thirtyLow = parseFloat(qoutes[fd]["3. low"])
        }
      }

      console.log(symbol);
      console.log(thirtyHigh);
      console.log(thirtyLow);
      console.log(qoutes["2020-01-16"]);
    }


  this.exponential = function(data) {
    let options = {
      precision:5,
      order:5
    }
    const sum = [0, 0, 0, 0, 0, 0];

    for (let n = 0; n < data.length; n++) {
      if (data[n][1] !== null) {
        sum[0] += data[n][0];
        sum[1] += data[n][1];
        sum[2] += data[n][0] * data[n][0] * data[n][1];
        sum[3] += data[n][1] * Math.log(data[n][1]);
        sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
        sum[5] += data[n][0] * data[n][1];
      }
    }

    const denominator = ((sum[1] * sum[2]) - (sum[5] * sum[5]));
    const a = Math.exp(((sum[2] * sum[3]) - (sum[5] * sum[4])) / denominator);
    const b = ((sum[1] * sum[4]) - (sum[5] * sum[3])) / denominator;
    const coeffA = Math.round(a, options.precision);
    console.log("B: " + b);
    const coeffB = b //Math.round(b, options.precision);
    const predict = x => ([
      Math.round(x, options.precision),
      Math.round(coeffA * Math.exp(coeffB * x), options.precision),
    ]);

    const points = data.map(point => predict(point[0]));

    return {
      points,
      predict,
      equation: [coeffA, coeffB],
      string: `y = ${coeffA}e^(${coeffB}x)`
      //r2: Math.round(determinationCoefficient(data, points), options.precision),
    };
  }

    this.calculateDerivative = function () {
      var now = new Date()
      stockData = []
      timeWindow = 365 * 5
      for (let i = 0; i <= timeWindow; i++ ) {
        var date_ = new Date().setDate(now.getDate() - i)
        let fd = this.formatDate(date_)
        if (qoutes[fd] === undefined){
          continue
        }
        stockData.push([timeWindow - i, parseFloat(qoutes[fd]["2. high"])])
      }

      const result = regression.exponential(stockData, {precision:10})
      const derivative = result.equation[0]*result.equation[1]*Math.pow(2.71828, 30 * result.equation[1])

      console.log(result.string);
      console.log("R2 = " + result.r2);
      console.log("Derivative today: " + derivative);
      console.log("");

      // TODO Plot graph and derivative
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
