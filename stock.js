
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
