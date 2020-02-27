'use strict';
const BC = require('./broker_controller');

module.exports = function(app) {
  // app.route('/newday')
  //   .get(function(req, res){
  //     BC.getTodaysQoutes().then(function(data, err){
  //       BC.pushTodaysQoutes(data)
  //       res.json(data)
  //     })
  //   });

  app.route('/newday')
    .post(function(req, res){
      BC.getTodaysQoutes(req.body.symbols).then(function(data, err){
        res.json(data)
      })
    });

  app.route('/incrementday')
    .get(function(req, res){
      // Send querry and fetch data
      BC.incrementDate()
    })

  app.route('/sell')
    .post(function(req, res){
      BC.sell(req.body).then(function(data){
        res.json(data)
      })
    })


  app.route('/buy')
    .post(function(req, res){
      BC.buy(req.body.results).then((offer) => {
        res.json(offer)
      })

      // req.body {buy:["MSFT", AAPL], sell:[]}
      // return {}
    })


  app.route('/backlog')
    .get(function(req, res){
      // Send querry and fetch data
      console.log("Sending backlog request");
      BC.getBacklog(req.query.symbol, req.query.days).then(function(data, err){
        res.json(data)
      })
    })

};
