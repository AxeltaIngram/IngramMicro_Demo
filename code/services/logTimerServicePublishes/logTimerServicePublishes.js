function logTimerServicePublishes(req, resp) {
    var now = new Date();
  log(req)
  log(now)
  var jsonData = JSON.parse(req.params.body);

  var data = {
        topic: req.params.topic,
        payload: new Date(jsonData.time)

    };
    log(data);
    ClearBlade.init({request:req});
  	var collection = ClearBlade.Collection({collectionName: "MessagePublishTest"});
  collection.create(data, function(err,data){
    if(err){
      log(data);
      resp.error("Couldn't create a row "+err);
    }
    else{
      resp.success('Success');
    }
  })
}