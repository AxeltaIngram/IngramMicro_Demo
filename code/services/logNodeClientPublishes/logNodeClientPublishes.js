function logNodeClientPublishes(req, resp) {
  var now = new Date();
  log(req)
  log(now)
  var jsonData = req.params.body;

  var data = {
        topic: req.params.topic,
        payload: new Date(jsonData)

    };
    log(data);
    ClearBlade.init({request:req});
  	var collection = ClearBlade.Collection({collectionName: "NodeClientMessagePublishTest"});
  collection.create(data, function(err,data){
    if(err){
      log(data);
      resp.error("Couldn't create a row"+err);
    }
    else{
      resp.success('Success');
    }
  })
}
