const fs = require('fs')

var startData = {
  name:"MA_50_200",
  balance:100000,
  risk:0.1,
  symbols_wishlist:["AAPL", "DIS", "GOOGL", "BP", "V", "AXP", "CMG", "MSFT", "BRK.A", "MMM", "HON", "BBY", "C", "MA"],
  owns:[
    {
      symbol:"MSFT",
      stocks:[
        {
          bought_at : 161.31,
          bought_date : "2020-01-20",
        },
        {
          bought_at : 141.32,
          bought_date : "2019-08-10",
        }
      ]
    },
    {
      symbol:"AAPL",
      stocks:[
        {
          bought_at : 291.34,
          bought_date : "2020-01-20",
        },
        {
          bought_at : 309.33,
          bought_date : "2019-08-10",
        }
      ]
    }
  ]
}

let jsond = JSON.stringify(startData);
fs.writeFile("portfolio/MA_50_200.portf", jsond, function(err) {
    if(err) {
      console.log("Error in filewrite");
      console.log(err);
    }
    console.log("Written!");
});
