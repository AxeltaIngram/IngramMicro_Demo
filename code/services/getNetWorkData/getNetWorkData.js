/**
 * @type{string} networkUUID - Network UUID 
 * @type{object} finalResult - Return result object
 * @type{object} sendData    - Global object
 * @type{string} _resp 		 - Global response string
 */

var networkUUID;
var finalResult={};
var sendData={};
var _resp;
var cb;
var user_id;

/**
 *  @typedef getNetWorkData
 *  TODO : getnetwork data function 
 *  @param {object} req - request object.It contains networkUUID parameter.
 *  @param {object} resp - response object.
 *  @param {string} networkUUID - Network UUID.
 *  @returns {object} - return network data including gateways and sensors 
 **/
function getNetWorkData(req, resp) {
	try{		
		_resp=resp;
		ClearBlade.init({request:req});
		cb=ClearBlade;
		var reqObj=req.params;
    user_id = req.userEmail;
		// checking networkUUID is in params object or not. if we are not passed networkUUID fetch it from 'devices_metadata' table
		if(! reqObj.hasOwnProperty("networkUUID"))
		{
			var nwquery = ClearBlade.Query({collectionName:devices_metadata});
			nwquery.columns(["network_uuid"]);
			nwquery.fetch(function(err,data){        
			if(err){
				_resp.error("ERROR 1"+stringToJSONConveter(data));
			}else{
				var networksArray=[];
				data.DATA.forEach(function(t){
					if(networksArray.indexOf(t.network_uuid)<0){
						networksArray.push(t.network_uuid);
					}
				});
				finalGwAry=[];
				finalResult["Method"]="NetWorkData";

				networksArray.forEach(function(nvalue){
					networkDetails(nvalue)
					.then(function(response){
                  finalGwAry=finalGwAry.concat(sendData.Result);
					});
				});
				finalResult["Result"]=finalGwAry; 
				_resp.success(finalResult);
			}
			}); 
		}else{
			networkUUID = req.params.networkUUID;
			// calling networkDetails() to get data
			networkDetails(networkUUID).then(function(){
				_resp.success(sendData);
			});
		}
	}
	catch(error){
		_resp.error("ERROR in getNetWorkData() "+ error);
	}
}

/**
 * 	@typedef networkDetails
 *  code to get single network details
 *  @param {string} nuuid - User Name.
 *	@returns {object} - returns network data
 **/
function networkDetails(nuuid){  
	try{
		var deferred = Q.defer();
		var query = ClearBlade.Query({collectionName:devices_metadata});
			query.equalTo("network_uuid",nuuid);
			processQuery(query);
			query.fetch(function(err,data){        
				if(err){
					deferred.reject(data);
				}else{
					var gateways =[];
					sendData.Method ="NetWorkData";
					for(var i=0; i< data.TOTAL ; i++){
						   var gatewayJson ={};
						   var sensor={};
						   var sensorList;  
						   var sensorData = []; 

						   
					var codeEngine = ClearBlade.Code();
					var serviceToCall = GatewaysGroup;
					var loggingEnabled = false;
					var params = {
							"networkUUID": data.DATA[i].network_uuid,
							// "username":"ingram@axelta.com",
							// "password":"Ingram@123",
							"gatewayID":data.DATA[i].gateway_id,
              "user_id":user_id
						};
            //serviceCallPromise(serviceToCall, params, loggingEnabled,codeEngine)
            callGatewayListService(params)
						.then(function(serviceRes){
							serviceRes=stringToJSONConveter(serviceRes);
							//if(serviceRes.success){
								// gatewayJson=serviceRes.results.Result[0]; 
                log("serviceRes  "+ JSON.stringify(serviceRes));
                  gatewayJson=serviceRes[0]; 
							//}
						}, function (reason) {
							resp.error("serviceCallPromise() because: " + reason);
						});
					if( gatewayJson !== undefined ){

					sensor = stringToJSONConveter(data.DATA[i].sensors);
					sensorList = sensor.sensorsList;                  
						for(var j in sensorList){
							// log("sensor -- "+ sensorList[j]);
							var sensorJson = {};
							// fetch data from 'sensors_data' table
							var query2 = ClearBlade.Query({collectionName:sensors_data});
								  query2.equalTo("sensor_id",sensorList[j]);
								  query2.descending("reading_time");
								  query2.setPage(1, 1);
								  processQuery(query2)
								  .then(function(promiseRes){
                                      var sen_data=promiseRes;

									  // sensorJson.SensorName = sen_data.DATA[0].sensor_name;
										//sensorJson = buildsensorData(sensorList[j]);
										buildsensorDataByID(sensorList[j])
										.then(function(result){
                                          sensorJson={
											"SensorName":result.sensor_name,
                                            "SensorType":result.sensor_type
										  };
										  if(!sen_data.TOTAL)
										{
                                        sensorJson.SensorID =sensorList[j];
										//sensorJson.SensorName="";
										//sensorJson.SensorType="";
										sensorJson.CurrentReading ="";
										sensorJson.LastCommunicationDate ="";
										sensorJson.BatteryLevel = "";
										sensorJson.SignalStrength = "";	
										}else{
											
										//sensorJson.SensorType = sen_data.DATA[0].
										//sensorJson.SensorCategory = sen_data.DATA[0].
										sensorJson.SensorID =sen_data.DATA[0].sensor_id;
										sensorJson.CurrentReading = sen_data.DATA[0].sensor_reading;
										sensorJson.LastCommunicationDate = sen_data.DATA[0].reading_time;
										sensorJson.BatteryLevel = sen_data.DATA[0].battery_level;
										sensorJson.SignalStrength = sen_data.DATA[0].signal_strength;	
										}
										sensorData[j] = sensorJson;
										},function(reason){
                                            _resp.error("Error:"+reason);
										}
										);
								  },function(prReason)
								  {
                                 _resp.error("ERROR in fetching Sensor data"+JSON.stringify(prReason));
								  }
								  );
						}
						gatewayJson.Sensors = sensorData;
						}
						else{
							continue;
						}
						gateways[i]=gatewayJson;
					}
					sendData.Result = gateways;    
					deferred.resolve("Success");   
				}
			});
			return  deferred.promise;
	}
	catch(error){
		_resp.error("ERROR in networkDetails() "+ error);
	}
}