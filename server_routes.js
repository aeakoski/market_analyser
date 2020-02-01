'use strict';
module.exports = function(app, _Brain) {

  app.route('/api/newday')
    .post(function(req, res){
      _Brain.newDay(req.body)
      res.send("OK")
    })

  app.route('/api/wishlist')
    .get(function(req, res){
      res.json({wishlist:_Brain.getWishlist()})
    })

  app.route('/api/plotdata')
    .get(function(req, res){
      let o = _Brain.getPlotData()
      //console.log(JSON.stringify(o, null, 2))
      res.json(o)
    })

  app.route('/api/stock')
    .put(function(req, res){
      if (_Brain.addNewStock(req.query.symbol.toUpperCase())){
        res.send("OK!")
      } else {
        res.send("NO NEW")
      }
    })
    .delete(function(req, res){
      console.log("Trying to delete")
      if (_Brain.deleteStock(req.query.symbol.toUpperCase())) {
        res.send("OK")
      } else {
        res.send("NO")
      }
    })
};
