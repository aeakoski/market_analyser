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
    .post(function(req, res){
      Handler.newDay(req.body)
      res.send("OK")
    })

  app.route('/api/plotdata')
    .get(function(req, res){
      let o = Handler.getPlotData()
      //console.log(JSON.stringify(o, null, 2))
      res.json(o)
    })

  app.route('/api/wishlist')
    .get(function(req, res){
      res.json({wishlist:Handler.getWishlist()})
    })

  // app.route('/api/stock')
  //   .put(function(req, res){
  //     if (_Brain.addNewStock(req.query.symbol.toUpperCase())){
  //       res.send("OK!")
  //     } else {
  //       res.send("NO NEW")
  //     }
  //   })
  //   .delete(function(req, res){
  //     console.log("Trying to delete")
  //     if (_Brain.deleteStock(req.query.symbol.toUpperCase())) {
  //       res.send("OK")
  //     } else {
  //       res.send("NO")
  //     }
  //   })
};
