'use strict';
module.exports = function(app, Handler) {

  app.route('/api/status')
    .get(function(req, res){
      Handler.status()
      res.send("OK")
    })

  app.route('/api/offer')
    .post(function(req, res){
      let outcome = Handler.manageOffer(req.body)
      res.send(outcome)
    })

  app.route('/api/newday')
    .get(function(req, res){
      Handler._newDay().then(_status => res.json({status:_status}))
    })

  app.route('/api/restrictions')
  .get(function(req, res){
    res.json({
      status:"OK",
      restrictions: Handler.getRestrictions()
    })
  })
  .post(function(req, res){
    Handler.manageRestrictions(req.body)
    res.json({status:"OK"})
  })

  app.route('/api/plotdata')
    .get(function(req, res){
      let o = Handler.compilePlotData()
      //console.log(JSON.stringify(o, null, 2))
      res.json(o)
    })

};
