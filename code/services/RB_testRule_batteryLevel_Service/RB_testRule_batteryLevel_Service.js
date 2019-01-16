function RB_testRule_batteryLevel_Service (req, resp) {
    
    var reqObject;

    try {
        reqObject = JSON.parse(req.params);
    } catch(e) {
        reqObject = req.params;
    }
  log(reqObject);
  log(req);
    
  ClearBlade.init(req);
  var query = ClearBlade.Query();
  query.equalTo('item_id', reqObject.items[0].item_id);
  //ClearBlade.Collection({ collectionName: reqObject.collectionName }).fetch(query, callBack);
  ClearBlade.Collection({ collectionName: "gateways_data" }).fetch(query, callBack);
  function callBack (err, data) {
      if(!err) {
          log("Successfully retrieved item");
         // if ((tryParse(data.DATA[0].battery_level).valueOf < "200")) {
              if (data.DATA[0].battery_level < 10) {
              log("Successful");
	//  callAlertProvider0();
     resp.success("working");
  }
  
      } else {
         resp.error("Failure while retrieving item; " + JSON.stringify(data));
      }
  }

    
    
    function callAlertProvider0 () {
      
        ClearBlade.init({request:req});
        ClearBlade.Code().execute("mailservice", Object.assign({ruleName: 'batteryLevel'}, req.params), true, function (err, body){
            if(err) {
                log("Failure while executing mailservice; " + JSON.stringify(err));
                resp.error(body);
            } else {
                log("Successfully executed mailservice");
                resp.success(body);
            }
        })
    
    }
    
    
    resp.success('Nothing to do');
  }
 
  function tryParse(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
}