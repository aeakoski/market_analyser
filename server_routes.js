'use strict';
module.exports = function(app, Handler) {

  app.route('/api/debug')
    .get(function(req, res){
      Handler.debug()
      res.send("OK")
    })


  app.route('/api/status')
    .get(function(req, res){
      Handler.status()
      res.send("OK")
    })

  app.route('/api/newday')
    .get(function(req, res){
      Handler._newDay()
      res.json({status:"OK"})
    })

  app.route('/api/plotdata')
    .get(function(req, res){
      let o = Handler.getPlotData()
      //console.log(JSON.stringify(o, null, 2))
      res.json(o)
    })

  app.route('/api/wishlist')
    .get(function(req, res){
      res.json({wishlist:Handler.getWishlist(req.query.portfolio)})
    })

};
