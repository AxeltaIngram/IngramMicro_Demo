// Service Caller
/**
 * 	@typedef serviceCall
 *  TODO :  Service Caller
 *  @params {string} serviceToCall -- calling service name
 *  @param {Boolean} loggingEnabled -- Boolean that represents whether or not the code service should use logging
 *  @param {callback} -- To handle response from code service
 **/
  function serviceCall(serviceName, parameters, loggingEnabled,codeEng){
      var deferred = Q.defer();
      var resToSend="";
      codeEng.execute(serviceName, parameters, loggingEnabled,function(err,data){
        if(err)
        {
          resToSend=err;
        }else{
          resToSend=data;
        }
      });
    return stringToJSONConveter(resToSend);
  }  


// Service Caller
/**
 * 	@typedef serviceCallPromise
 *  TODO :  Service Caller
 *  @params {string} serviceToCall -- calling service name
 *  @param {Boolean} loggingEnabled -- Boolean that represents whether or not the code service should use logging
 *  @param {callback} -- To handle response from code service
 **/
  function serviceCallPromise(serviceName, parameters, loggingEnabled,codeEng){
    var deferred = Q.defer();
    codeEng.execute(serviceName, parameters, loggingEnabled,function(err,data){
      if(err){
        deferred.reject(err);
      }else{
        var response = stringToJSONConveter(data);
        deferred.resolve(response);
      }
    });
    return deferred.promise;
  } 
// To  Execute Imonnit API services.
function immonitResponse(URI) {
    var requestObject = Requests();
    var response = "failed";
    var options = {  uri: URI  };
    requestObject.get(options, function(err, data) {
    try{
        if (err) {
           response =  stringToJSONConveter(err);
        } else {
            response = stringToJSONConveter(data).Result;
        }
       // return response;
    }catch(e){
        response=e;
    }    
  });
return response;
}


/**
 * 	@typedef getSensorsDataByID
 *  get data from sensors_data table based on sensor_id
 *  @params {number} sensorId -- sensor_id
 *	@returns {object} -- returns sensors data  from 'sensors_data' table
 **/
// function getSensorsDataByID(sensorId){
// 	try{
	
// 		var sensorJson = {};
// 		var retObj = {};
// 		var query2 = ClearBlade.Query({collectionName: sensors_data});
// 			query2.equalTo("sensor_id",sensorId);
// 				if(reqObj.hasOwnProperty("fromTS") && reqObj.hasOwnProperty("toTS")){
// 					query2.greaterThan("reading_time",reqObj.fromTS);
// 					query2.lessThan("reading_time",reqObj.toTS);
// 				}
// 				else{
// 					query2.descending("reading_time");
// 					query2.setPage(1, 1);
// 				}  
// 			query2.fetch(function(err,data){
// 				if(err){
// 					response.error("ERROR in fetching Sensor data"+JSON.stringify(data));
// 				}
// 				else{
// 							retObj = data;                        
// 				}
// 			});
//         return retObj;
// 	}
// 	catch(error){
// 		response.error("ERROR in getSensorsDataByID() "+ error);
// 	}
// }

/**
 * 	@typedef buildsensorData
 *  get sensors name,type  from 'Sensors' table and merge it into Sensors Json
 *  @params {object} sensorJson -- sensor json which get are taken from 'sensors_data' table
 *	@returns {Array} -- returns sensors data array  
  **/
function buildsensorDataByJSON(sensorJson){
	try{
    var deferred = Q.defer();
  // log("sensor "+ sensor_id);
  var mul_sensorData=[];
  var sensor_data={};
  var sensorName = "";
  var sensorType = "";
  var sensor_id = sensorJson.DATA[0].sensor_id; 
  var query2 = ClearBlade.Query({collectionName: Sensors});
        query2.equalTo("sensor_id",sensor_id);
        processQuery(query2).then(function (senData) {   
          // log(sensor_id +" sensor data "+JSON.stringify(senData));                           
            if(senData.TOTAL > 0){
              sensorName = senData.DATA[0].sensor_name;
              sensorType = senData.DATA[0].sensor_type;
              // log("sensor data "+sensor_data);
            } 
            sensorJson.DATA.forEach(function(data){
              data.sensor_name = sensorName;
              data.sensor_type = sensorType;
              mul_sensorData.push(data);
            }); 
            deferred.resolve(mul_sensorData); 
          }, function (reason) {
              deferred.reject(reason);
          }
        );
        return  deferred.promise;
	}
	catch(error) {
		return error;
	}
}

/**
 * 	@typedef DBConnector
 *  get sensor data and append to passed object 
 *  @param {number} sensorJson - sensor_id.
 *  @returns {object} - returns the json object it contains sensor_type and sensor_name
 **/
function buildsensorDataByID(sensor_id){
	try{
    var deferred = Q.defer();
  // log("sensor "+ sensor_id);
  var sensor_data={};
  var query2 = ClearBlade.Query({collectionName: Sensors});
        query2.equalTo("sensor_id",sensor_id);
        processQuery(query2)
        .then(function (senData) {   
          // log(sensor_id +" sensor data "+JSON.stringify(senData));                           
            if(senData.TOTAL > 0){
              sensor_data.sensor_id = senData.DATA[0].sensor_id;
              sensor_data.sensor_name = senData.DATA[0].sensor_name;
              sensor_data.sensor_type = senData.DATA[0].sensor_type;
              // log("sensor data "+sensor_data);
            }                
            else{
              sensor_data.sensor_id=sensor_id;
              sensor_data.sensor_name="";
              sensor_data.sensor_type="";
            } 
            deferred.resolve(sensor_data); 
          }, function (reason) {
              deferred.reject(reason); 
          }
        );
        return  deferred.promise;
	}
	catch(error) {
		return error;
	}
}

//Promise function
function returnPromice(){
  var deferred = Q.defer();
}



// Returns List og gateways in networks
function groupOfGatewaysinNetwork(qresult,user_id)
{
  var deferred = Q.defer();
    log("Result: "+qresult+" userEmail: "+user_id);
    var groupOfGateways=[];
// if(err){
//  return "Error in getting gateways list of network";
// }else{
  var glist=qresult.DATA;
  glist.forEach(function(gObj,i){
          var gatewayObject={};
          var assoSensors=JSON.parse(gObj.sensors).sensorsList;
          var customers = gObj.customer_name;
          var user_check = customers.indexOf(user_id); //To check gateway is assigned to user or not 
           log("Check --- "+ user_check +"Gateway_ID:"+gObj.gateway_id);
          if(user_check > -1){
            //Fetching datafrom gateways_data Table
            var gdetailsQuery=ClearBlade.Query({"collectionName":gateways_data});
              gdetailsQuery.equalTo("gateway_id",gObj.gateway_id);
              gdetailsQuery.descending("reading_date");
             
              gdetailsQuery.fetch(function(gerr,gdetails){
                if(gerr){
                 return "Error in getting "+gObj.gateway_id+"gateway details";
                }else{
                  if(gdetails.TOTAL===0){
                  //gatewayObject["GatewayName"]="";
                  gatewayObject["BatteryLevel"]="";
                  gatewayObject["SignalStrength"]="";
                  gatewayObject["LastCommunicationDate"]="";
                  }else{
                 // gatewayObject["GatewayName"]=gdetails.DATA[0].gateway_name;
                  gatewayObject["BatteryLevel"]=gdetails.DATA[0].battery_level;
                  gatewayObject["SignalStrength"]=gdetails.DATA[0].signal_strength;
                  gatewayObject["LastCommunicationDate"]=(new Date(gdetails.DATA[0].reading_date)).getTime();
                  }
                gatewayObject["GatewayName"]=gObj.gateway_name;
                gatewayObject["NetworkID"]=gObj.network_id;
                gatewayObject["NetworkUUID"]=gObj.network_uuid;
                gatewayObject["NetworkName"]=gObj.network_name;
              
                gatewayObject["GatewayID"]=gObj.gateway_id;
                gatewayObject["GatewayType"]=gObj.gateway_type;
                gatewayObject["ConfiguredSensors"]=assoSensors.length;
                gatewayObject["Heartbeat"]=gObj.gateway_heartbeat;
                
                gatewayObject["MAC_Address"]=gObj.mac_address;
                
                gatewayObject["ClientName"]=JSON.parse(gObj.customer_name).users;
                }
              }); 

              log("Gateway Object:"+JSON.stringify(gatewayObject) );                 
           groupOfGateways.push(gatewayObject);
           log("Group Of gateway:"+JSON.stringify(groupOfGateways) );
        } 
  });
 deferred.resolve(groupOfGateways);
 return  deferred.promise;
}
//Process Query
function processQuery(QueryObj)
{
    var deferred = Q.defer();
    QueryObj.fetch(function(err,res){
        if(err)
        {
        deferred.reject(new Error("Status code was " + JSON.stringify(err)));
        }else{            
        deferred.resolve(res);
        }
    });
    // log("res "+JSON.stringify(deferred));
    return deferred.promise;
}

//Returns JSON object
function stringToJSONConveter(objectToConvert){
    var convertedObject;
try{
convertedObject=JSON.parse(objectToConvert);
}catch(e){
convertedObject=objectToConvert;
}
return convertedObject;
}
/**
 * 	@typedef generateUUID
 *  TODO: generate UUID 
 *  @param {string} network_ID - network_ID.
 *	@returns {UUID} returns generated UUID 
 **/
function generateUUID(inputstr){
  var encryptFormat = crypto.createHash("md5");
	encryptFormat.update(inputstr);
  var encryptedString = encryptFormat.digest("hex");
  encryptedString = encryptedString.slice(0, 8) + "-" + encryptedString.slice(8, 12) + "-" + encryptedString.slice(12, 16)+"-" + encryptedString.slice(16, 20)+"-" + encryptedString.slice(20, 32);
  return encryptedString;
}


//Create a record
/**
 * @typedef createRecord
 * Creates new item in given collection with gives values 
 * @param {string} tbl - into which collection data is getting stored
 * @param {json} values - object to store into collection
 **/
function createRecord(tbl, values) {
    var col = ClearBlade.Collection({ collectionName: tbl });
    col.create(values, statusCallBack);
}
/**
 * 	@typedef getDevicesSensorData
 *  TODO: Get Devices_metadata each row sensors data
 *  @param {object} meta_data
 *	@returns {object} deferred object 
 **/
function getDevicesSensorData(meta_data){
  var deferred = Q.defer();
  var final_data=[];
    meta_data.DATA.forEach(function(row){
              var json = stringToJSONConveter(row);
              var customers_json  = stringToJSONConveter(json.customer_name);
              var customers =JSON.stringify(customers_json.users);
              var cus_check = customers.indexOf(customer);
              var gateway_id = json.gateway_id;
              if(cus_check > 0){
                var sensors = json.sensors;
                json.customer_name = customers_json.users;
                var sensors_json =  stringToJSONConveter(sensors);
                var sensorsList = sensors_json.sensorsList;
                getSensorListData(sensorsList).then(function (sensor_array) {
                  log("gateway "+ gateway_id+" sensor Data "+ JSON.stringify(sensor_array) );
                  json.sensors = sensor_array;
                  final_data.push(json);
                  deferred.resolve(final_data); 
                  
                },function(reason){
                  deferred.reject(reason); 
                });                
              }  
    });
    return  deferred.promise;
}

/**
 * 	@typedef getSensorListData
 *  TODO: get All sensors data which are passed on the array
 *  @param {Array} sensorsList
 *	@returns {object} deferred object 
 **/
function getSensorListData(sensorsList){
  var deferred = Q.defer();
  var sensor_array =[];
    for(var sl=0; sl < sensorsList.length; sl++){
      // var sensor_data = {};
      var sensor_id = sensorsList[sl];
      sensor_data = buildsensorDataByID(sensor_id).then(function (sensor_data) {
          // log("result of buildsensorDataByID "+JSON.stringify(sensor_data));
          sensor_array.push(sensor_data);            
        },function(reason){
          deferred.reject(reason); 
        });
    }
    deferred.resolve(sensor_array); 
    return  deferred.promise;
}


// To  Execute Imonnit API services.
/**
 * @typedef immonitResponseNew
 * get sensors list from devices_metadata table
 * @param {string}  URI - URI
 * @returns {string} - success/failed
 * 
 */
function immonitResponseNew(URI) {
    var deferred = Q.defer();
    var requestObject = Requests();
    var response = "failed";
    var options = {  uri: URI  };
    requestObject.get(options, function(err, data) {
        if (err) {
           deferred.reject(stringToJSONConveter(err));
        } else {
      deferred.resolve(stringToJSONConveter(data).Result); 
        }
    });
  return  deferred.promise;
}