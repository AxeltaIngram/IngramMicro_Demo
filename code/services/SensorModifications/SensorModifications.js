var response;
var auth_token;
/**
 *  @typedef SensorModifications
 *  ADD / DELETE sensor in Imonnit and Clearblade platform
 *  @param {object} req - request object.It contains gateway_id,sensor_id,method parameters.
 *  @param {object} resp - response object.
 *  @param {string} req.params.gateway_id  - Gateway id
 *  @param {number} req.params.sensor_id   -  Sensor id.
 *  @param {string} req.params.method      -  insert/remove .
 *  @returns--
      ADD / DELETE sensor in Imonnit and Clearblade platform response
 **/
function SensorModifications(req, resp) {
  response = resp;
  var reqObj = req.params;
  var msg ={};
  ClearBlade.init({request:req});
  if(reqObj.hasOwnProperty("method") && reqObj.hasOwnProperty("sensor_id")  && reqObj.hasOwnProperty("gateway_id") && reqObj.hasOwnProperty("username") && reqObj.hasOwnProperty("password")){
    var method = reqObj.method;
    var gateway_id = reqObj.gateway_id;
    var sensor_id = reqObj.sensor_id;
    var network_id=reqObj.network_id;
    //var auth_token= getImAuthKey(reqObj.username,reqObj.password);
    var username = reqObj.username;
    var password = reqObj.password;
    immonit.init(username,password).then(function(auth_token){
    log("auth "+auth_token);  
    var URI="";
    var imonitResult;
    var sensorOprs = immonit.Sensor(sensor_id);
    if(method === "remove"){
        sensorOprs.Remove(gateway_id,auth_token).then(function(updt_result){
          if(updt_result === "Success"){
             log("removed sensor from imonnit successfully!");
             getSensorsList(gateway_id)
             .then(function(result){
               
              var sensorList=result;
              var str_sensor_id = sensor_id.toString();
              var sensorList_2 = [];
              sensorList.forEach(function(t){
                  if(str_sensor_id != t){
                      sensorList_2.push(t);
                  }
              });  
             updateSensorsList(gateway_id,sensorList_2)
             .then(function(res){
               var remove_sensor = ClearBlade.Query({collectionName: Sensors});
                    remove_sensor.equalTo('sensor_id', sensor_id);
                    remove_sensor.remove(function (err, data) {
                        if (err) {
                          response.error("Sensors table removal error : " + JSON.stringify(data));
                        } else {
                         // response.success(data);
                         log("final step");
                         log(JSON.stringify(data));
                         response.success("Success");
                        }
                    });
             });
             },function(reason){
                response.error(reason);
             });

            }else{
              response.error(updt_result);
            }  
        },function(reason){
            response.error(reason);
        });        
      }
      else if(method === "insert"){
        var newSensor = {"sensor_id": sensor_id};
        var checkDigit = reqObj.checkDigit;
        
        sensorOprs.Assign(gateway_id,auth_token,network_id,checkDigit).then(function(inst_result){
            if(inst_result === "Success"){
              log("sensor inserted successfully in imonnit");
              var sensorList =  [];
              getSensorsList(gateway_id)
              .then(function(sensorList_res){
              sensorList_res.push(sensor_id.toString());
                sensorList_res.forEach(function(val){
                  if(sensorList.indexOf(val) === -1){
                    sensorList.push(val);
                  }
                });
              updateSensorsList(gateway_id,sensorList)
             .then(function(res){
                var insert_sensor = ClearBlade.Collection({collectionName: Sensors});
                  var query = ClearBlade.Query();
                    query.equalTo("sensor_id", sensor_id);
                    insert_sensor.fetch(query, function (err, data) {
                      if (err) {
                        response.error("Sensors table Insertion error : " + JSON.stringify(data));
                      } 
                      else {
                        if(data.TOTAL > 0){
                          msg.Message = "Duplicate Sensor ID";
                          response.error(JSON.stringify(msg));
                        }
                        else{
                          insert_sensor.create(newSensor, function (err, data) {
                              if (err) {
                                response.error("Sensors Table Insertion ERROR : " + JSON.stringify(data));
                              } else {
                                //response.success(data);
                                response.success("Success");
                              }
                          });
                        }
                      }
                  }); 
             },function(ecause){
               response.error(ecause);
             });
              },function(reason){
                 response.error(reason);
              });
            }else{
              response.error(inst_result);
            }
        },function(reason){
            response.error(reason);
        });
      }
    },
    function(reason){
        resp.error(reason);
    });

  }
  else{
    msg.Message = "Invalid parameters";
    response.error(JSON.stringify(msg));
  }
  
}



/**
 * @typedef getSensorsList
 * get sensors list from devices_metadata table
 * @param {number}  gateway_id - Gateway id
 * @returns {array} - sensors List
 * 
 */
function getSensorsList(gateway_id){
  var deferred = Q.defer();
  var sensorList=[];
  var devices_metadata_query = ClearBlade.Query({collectionName:devices_metadata});
    devices_metadata_query.equalTo("gateway_id", gateway_id);
    devices_metadata_query.fetch(function (err, data) {
        if (err) {
          //response.error("ERROR in getSensorsData() : " + JSON.stringify(data));
          deferred.reject(JSON.stringify(data)); 
        } else {
               var sensors = JSON.parse(data.DATA[0].sensors);  
               sensorList =  sensors.sensorsList;
               deferred.resolve(sensorList); 
              //  log("sensors "+JSON.stringify(sensors));
        }
    });    
    return deferred.promise;
}

/**
 * @typedef updateSensorsList
 * update devices_metadata table sensors column
 * @param {number}  gateway_id - Gateway id
 * @param {Array}  sensorList - sensors List
 * @returns {string} - "success" or ERROR
 * 
 */
function updateSensorsList(gateway_id,sensorList){
  var deferred = Q.defer();
  var sensors ={};
  var res ;
  // log("sensorList " + sensorList);
  sensors["sensorsList"] = sensorList;
  // log("sensors "+ JSON.stringify(sensors));
  var query = ClearBlade.Query({collectionName: devices_metadata});
    query.equalTo("gateway_id", gateway_id);
    var changes = {
        sensors: JSON.stringify(sensors)
    };    
    query.update(changes, function (err, data) {
        if (err) {
        //  response.error("update error : " + JSON.stringify(data));
         deferred.reject(JSON.stringify(data)); 
        } else {
           deferred.resolve("success"); 
        //  res= "success";
        }
    });
    return deferred.promise;
}