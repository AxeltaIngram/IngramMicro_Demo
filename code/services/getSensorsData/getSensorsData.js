
/**
 * @type{object} sendData - Global result object
 * @type{object} response    - Global response object
 * @type{string} _resp 		 - Global response string
 */
var sendData={};
var response;
var reqObj= {};
/**
 * 	@typedef getSensorsData
 *  get Sensors data 
 *  @param {object} req - request object.It contains networkUUID,gatewayID,sensorID,fromTS,toTS parameters.
 *  @param {object} resp - response object.
 *  @param {string} networkUUID - Network UUID.
 *  @param {number} gatewayID - Gateway Id.
 *  @param {number} sensorID -  Sensor Id.
 *  @param {number} fromTS - Staring timestamp to get sensors data from 'sensors_data' table.
 *  @param {number} toTS  - End timestamp to get sensors data from 'sensors_data' table.
 * 
 *  @returns {object} ------
 * 	valid input params : ----
 *  1) networkUUID     		-- It returns all gateways data in network along with latest sensor data
 *  2) networkUUID,fromTS,toTS   -- It returns all gateways data in network along with sensor data between from and to timestamps
 *  3) networkUUID,gatewayID  --- It returns gateway data in network along with latest sensor data
 * 	4) networkUUID,gatewayID,fromTS,toTS  -- It returns gateway data in network along with sensor data between from and to timestamps
 * 	5) networkUUID,gatewayID,sensorID -- It returns sensor latest data 
 *  6) networkUUID,gatewayID,sensorID,fromTS,toTS --- It returns sensor data between from and to timestamps
 *	
 **/
function getSensorsData(req, resp) {
	try{
	// log("Request Object:"+ JSON.stringify(req));
		ClearBlade.init({request:req});
		response = resp;
		reqObj=req.params;
		if(reqObj.hasOwnProperty("networkUUID") ){
			getData();
		}
		else{		
			sendData.message = "Invalid parameters 'Network UUID' missed ";	
			//TODO Need to know the reason why response.error()	is not being used
			response.error(sendData);			
		}
	}
	catch(error){
		response.error("ERROR in getSensorsData() "+ error);
	}
}

/**
 * 	@typedef getData
 *  @params -- it use global variables
 *	@returns {object} -- gateways data
 **/
function getData(){
	try{
		var nuuid = reqObj.networkUUID
		var query = ClearBlade.Query({collectionName:devices_metadata});
			query.equalTo("network_uuid",nuuid);
			if(reqObj.hasOwnProperty("gatewayID")){
				query.equalTo("gateway_id",reqObj.gatewayID);
			}
			processQuery(query).then(function (data) {
					 //log("Query DATA  "+JSON.stringify( data));
					var gateways =[];
					sendData.Method ="getSensorsData";
					for(var i=0; i< data.TOTAL ; i++){
						var gatewayJson ={};
						var sensor={};
						var sensorList=[];  
						var sensorData = {}; 
						log("Gateway Id : "+data.DATA[i].gateway_id);
						gatewayJson.Gateway_ID = data.DATA[i].gateway_id;
						gatewayJson.Gateway_Type = data.DATA[i].gateway_type;
						//Sensor Data Building
						sensor = stringToJSONConveter(data.DATA[i].sensors);
						sensorList = sensor.sensorsList;                  
						//  log("SensorList " + sensorList);

						if(reqObj.hasOwnProperty("sensorID")){
							if(reqObj.hasOwnProperty("gatewayID")){		
								var sensorID = reqObj.sensorID;
								var sensor_key = "sensor_"+sensorID;
								var check = sensorList.indexOf(sensorID.toString());
								//log("check-----> "+ check + " sensor "+ sensorID);
								if(check > -1){
									//Get sensor data
									getSensorsDataByID(sensorID).then(function (sensorJson) {
										if(sensorJson.TOTAL > 0){
										//sensorData[sensor_key] = buildsensorData(sensorJson);	
										buildsensorDataByJSON(sensorJson).then(function (res_sensor_data) {
											sensorData[sensor_key] = res_sensor_data;											
										},
										function(reason){
											 resp.error("promise failed because: "+reason);
										});
									}
									}); 
								}
								else{
									sensorJson.message = "Invalid sensor id ";		
									response.success(sensorJson);			
								}
							}
							else{
									sensorJson.message = "Invalid parameters 'Gateway Id' missed ";		
									response.success(sensorJson);			
							}
						}
						else{
							for(var j in sensorList){
								getSensorsDataByID(sensorList[j]).then(function (sensorJson) {
									if(sensorJson.TOTAL > 0 ){
									buildsensorDataByJSON(sensorJson).then(function (res_sensor_data) {
										var sensorID = sensorJson.DATA[0].sensor_id; 
										var sensor_key = "sensor_"+sensorID;
											sensorData[sensor_key] = res_sensor_data;											
										},
										function(reason){
											 resp.error("promise failed because: "+reason);
										});
									}
								});
							}
						}	
						gatewayJson.DATA = sensorData;
						gateways[i]=gatewayJson;
					}
					sendData.Result = gateways;  
					
			}, 
			function (reason) {
				  resp.error("promise failed because: "+reason);
			});
		response.success(sendData);
	}
	catch(error){
		response.error("ERROR in getData() "+ error);
	}
}

/**
 * 	@typedef getSensorsDataByID
 *  get data from sensors_data table based on sensor_id
 *  @params {string} sensor_id -- sensor_id
 *	@returns {object} -- returns sensors data  from 'sensors_data' table
 **/
function getSensorsDataByID(sensorId){
	 var deferred = Q.defer();
	try{
	
		var sensorJson = {};
		var retObj = {};
		var query2 = ClearBlade.Query({collectionName: sensors_data});
			query2.equalTo("sensor_id",sensorId);
				if(reqObj.hasOwnProperty("fromTS") && reqObj.hasOwnProperty("toTS")){
					query2.greaterThan("reading_time",reqObj.fromTS);
					query2.lessThan("reading_time",reqObj.toTS);
				}
				else{
					query2.descending("reading_time");
					query2.setPage(1, 1);
				}  
				processQuery(query2).then(function (sensor_data) {
					deferred.resolve(sensor_data);
				}, function (reason) {
					resp.error("promise failed because: "+reason);
				});  
			return  deferred.promise;

	}
	catch(error){
		response.error("ERROR in getSensorsDataByID() "+ error);
	}
}