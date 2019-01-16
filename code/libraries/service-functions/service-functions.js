//ADD below Libraries
//-- > ImmonitSDK
//-- > q_library
//-- > library-functions
//deferred.resolve
var auth_token = superUser_auth;
function callDeleteGateWayService(reqObj) {
 var deferred = Q.defer();
 var msg = {};
 if (reqObj.hasOwnProperty("auth_token")) {
  auth_token = reqObj.auth_token;
 }
 if ((reqObj.hasOwnProperty("method")) && (reqObj.hasOwnProperty("gateway_id"))) {
  var dev = ClearBlade.Device();
  var gateway_id = reqObj.gateway_id;
  var imResult;
  var method = reqObj.method;
  var URI = "";
  var gatewayOprs = immonit.Gateway(gateway_id);
  if (method === "update") {
    log("Update........");
   gatewayOprs.Update(auth_token).then(function(result) {
    deferred.resolve(result);
   }, function(reason) {
    response.error(reason);
   });
  }
  else if (method === "remove") {
    log("Delete........");
   gatewayOprs.Remove(auth_token).then(function(imResult) {
    deferred.resolve(result);
    if (imResult == "Success") {
     var del_query = ClearBlade.Query({
      collectionName: devices_metadata
     });
     del_query.equalTo("gateway_id", gateway_id);
     del_query.remove(function(err, data) {
      if (err) {
       deferred.reject("deletion error : " + stringToJSONConveter(data));
      } else {
       deferred.resolve(imResult);
      }
     });
    } else {
     deferred.reject(imResult);
    }
   }, function(reason) {
    response.error(reason);
   });
  }
  else if (method === "reform") {
    log("Reform........");
   gatewayOprs.Reform(auth_token).then(function(result) {
    deferred.resolve(result);
   }, function(reason) {
    response.error(reason);
   });
  }
  else {
   msg.Message = "Invalid Method ";
   deferred.resolve(stringToJSONConveter(msg));
  }
 } else {
  msg.Message = "Invalid Parameters ";
  deferred.reject(stringToJSONConveter(msg));
 }
 return deferred.promise;
}

function callGatewayListService(reqObj){
  log("req Obj "+ JSON.stringify(reqObj));
  var deferred = Q.defer();
  if (reqObj.hasOwnProperty("networkUUID") && reqObj.hasOwnProperty("user_id") ) {
    var networkUUID = reqObj.networkUUID;
    var user_id = reqObj.user_id;
    var codeEngine = ClearBlade.Code();
      var gListQuery=ClearBlade.Query({"collectionName":devices_metadata});
      gListQuery.equalTo("network_uuid",networkUUID);
      if(reqObj.hasOwnProperty("gatewayID")){
        gListQuery.equalTo("gateway_id",reqObj.gatewayID);
      }
      log("networkUUID "+networkUUID + " user_id "+ user_id + " gatewayID "+reqObj.gatewayID);
      processQuery(gListQuery).then(function (value) {
        groupOfGatewaysinNetwork(value,user_id).then(function(gatewaysList){
              deferred.resolve(stringToJSONConveter(gatewaysList));
        }, function (reason) {
            deferred.reject("promise failed because 1 : "+ reason);
        });
      }, function (reason) {
          deferred.reject("promise failed because 2 : "+ JSON.stringify(reason) );
      });
  }
  else{
    deferred.reject("Invalid Parameters..!");
  }
  return deferred.promise;
}
//SensorList --> GatewayList
//getNetWorkData -->GatewayList
//RB_testRule_batteryLevel_Service  --> mailservice