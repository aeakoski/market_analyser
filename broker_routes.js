'use strict';
const BC = require('./broker_controller');

module.exports = function(app) {
  app.route('/newday')
    .put(function(req, res){
      BC.getTodaysQoutes().then(function(data, err){
        BC.pushTodaysQoutes(data)
        res.json(data)
      })
    });

  app.route('/backlog')
    .get(function(req, res){
      // Send querry and fetch data
      console.log("Sending backlog request");
      BC.getBacklog(req.query.symbol, req.query.days).then(function(data, err){
        res.json(data)
      })
    })

};
