
var _req,_resp,gatewaysArray,gatewaydata;

/**
 * @typedef imonnitGatewayDetails
 * TODO:Updates gateways heartbeat and MAC address by calling imonnit APIs.
 * @type{object} _req - making request object available throught the service
 * @type{object} _resp - making response object available throught the service
 * @type{Array} gatewaysArray - List of gateways to update
 * @type{object} gatewaydata - individual gateway object to update
 */
function imonnitGatewayDetails(req, resp) {
  _req=req;
  _resp=resp;
  ClearBlade.init({request:req});
 var query = ClearBlade.Query({collectionName: devices_metadata});
  if(req.params.hasOwnProperty("gatewayID"))
  {
 query.equalTo("gateway_id",req.params.gatewayID);
  }else{
    query.columns(["gateway_id"]);
  }
 query.fetch(listOfGateways);  
}

/**
 * @callback listOfGateways
 * Updates gateways heartbeat and MAC address by calling imonnit APIs.
 * @param {object} err - eror object
 * @param {object} qresp - response object of Query
 */
var listOfGateways=function(err,qresp){
  if(err)
  {
    log("error: " + JSON.stringify(qresp));
    _resp.error(qresp);
  }else{
     gatewaysArray=qresp.DATA;
     gatewaysArray.forEach(function(value){
       log(value.gateway_id);
         var requestURL;
         if(parseInt(value.gateway_id) === 913201){
            requestURL="https://www.imonnit.com/JSON/GatewayGet/QXhlbHRhOkF4ZWx0QTIh?gatewayID="+value.gateway_id;
         }else if(parseInt(value.gateway_id)===932965){
            requestURL="http://40.86.214.108/json/GatewayGet/aW5ncmFtLmxhYjp3M0xjb20zSW5ncmFt?gatewayID="+value.gateway_id;
         //requestURL="";
         }else{
           requestURL="";
         }

      // return value.gateway_id;
     if(requestURL != "")     
     {
      log(requestURL);
       var requestObject = Requests();
       var options={
          "uri":requestURL,
           "timeout":30
       }
        requestObject.get(options,function(err, imresp){
        if(err){
            _resp.error("Unable to HTTP GET: " + JSON.stringify(err))
        }else{
         gatewaydata=JSON.parse(imresp).Result;
        log(gatewaydata);

          var colquery = ClearBlade.Query();
              colquery.equalTo('gateway_id', parseInt(gatewaydata.GatewayID));
          var changes = {
                        "gateway_heartbeat":gatewaydata.Heartbeat,
                        "Mac_Address":gatewaydata.MacAddress,
                        "gateway_type":gatewaydata.GatewayType
                       };
          var col = ClearBlade.Collection({collectionName: devices_metadata});
             col.update(colquery, changes, statusCallBack);
            //  _resp.success("success");
        }
        });
     }
     });
   //  _resp.success("success");
  }
};

/**
 * @callback statusCallBack
 * @param {object} err - eror object
 * @param {object} data - response object of gateway details Query
 */
var statusCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
    	_resp.error(data);
    } else {
        log(data);
        _resp.success("success");
    }
};