/**
 * @type{object} reqObj - Global Request object
 * @type{object} msg    - Global message object
 */
var reqObj= {};
var msg = {};
var customer ;
/**
 * 	@typedef updateGatewayDetails
 * update passed gateway details (or) get gateway data . 
 *  @param {object} req - request object.It contains gateway_id,network_id,network_uuid,sensors,customer_name,gateway_heartbeat,gateway_name,gateway_type,network_name parameters.
 *  @param {object} resp - response object.
 *  @param {number} gateway_id       - gateway id.
 *  @param {number} network_id       - network id.
 *  @param {string} network_uuid     - network uuid
 *  @param {object} sensors          - sensors .
 *  @param {string} customer_name    - user name
 *  @param {number} gateway_heartbeat- heartbeat
 *  @param {string} gateway_name     - Gateway Name
 *  @param {string} gateway_type     - Gateway Type
 *  @param {string} network_name     - Network Name
 *	@returns ---
        update passed gateway details. 
        If we pass empty parameters it returns the each gateway data including sensors data.
 **/
function updateGatewayDetails(req, resp) {
    ClearBlade.init({request:req});
    reqObj= req.params;
    customer = req.userEmail;
    var count = Object.keys(reqObj).length;
    if(count > 0 ){
      var changes = {};
      var sensor_changes = [];
      if(reqObj.hasOwnProperty("gateway_id") ){
        
        if(reqObj.hasOwnProperty("network_id")){
            changes.network_id = reqObj.network_id;         
        }
        if(reqObj.hasOwnProperty("network_uuid")){
            changes.network_uuid = reqObj.network_uuid ;
        }
        if(reqObj.hasOwnProperty("sensors")){
          var sensor_list = [];
          var listObj = {};
          var sensorObj = reqObj.sensors;
          sensorObj.forEach(function(data){
            sensor_list.push(data.sensor_id.toString());
            sensor_changes.push(data);
          });
          listObj.sensorsList = sensor_list;
          changes.sensors= JSON.stringify(listObj); 
          // log("sensor data "+ changes.sensors);
        }

        if(reqObj.hasOwnProperty("customer_name")){
          var cus_json ={"users":reqObj.customer_name};

          changes.customer_name = JSON.stringify(cus_json);
        }
        if(reqObj.hasOwnProperty("gateway_heartbeat")){
          changes.gateway_heartbeat = reqObj.gateway_heartbeat ;
        }
        if(reqObj.hasOwnProperty("gateway_name")){
          changes.gateway_name = reqObj.gateway_name ;
        }
        // if(reqObj.hasOwnProperty("mac_address")){
        //   changes.mac_address = reqObj.mac_address ;
        // }
        if(reqObj.hasOwnProperty("gateway_type")){
          changes.gateway_type = reqObj.gateway_type ;
        }
        if(reqObj.hasOwnProperty("network_name")){
          changes.network_name = reqObj.network_name ;
        }
        var changes_count = Object.keys(changes).length;
        if(changes_count > 0){
          // log("Changes "+JSON.stringify(changes));
          var query = ClearBlade.Query({collectionName: devices_metadata});
              query.equalTo("gateway_id",reqObj.gateway_id );
              query.update(changes, function(err,data){        
                if(err){
                  resp.error("ERROR "+JSON.stringify(data));
                }else{
                    log("sensor -------"+JSON.stringify(sensor_changes));
                    sensor_changes.forEach(function(sen_data){
                      var sen_query = ClearBlade.Query({collectionName: Sensors});
                          sen_query.equalTo("sensor_id",sen_data.sensor_id );
                          processQuery(sen_query).then(function (sensor_data) {
                                var callback =  function(err,update_data){        
                                    if(err){
                                      resp.error("Sensor Data ERROR  "+JSON.stringify(update_data));
                                    }                                    
                                  };
                                if(sensor_data.TOTAL > 0){
                                  log("Updated sensor Data "+ JSON.stringify(sen_data));
                                  sen_query.update(sen_data,callback);
                                }
                                else{
                                  log("Inserted sensor Data "+ JSON.stringify(sen_data));
                                  var col = ClearBlade.Collection( {collectionName: Sensors } );
                                      col.create(sen_data, callback);
                                } 
                          }, function (reason) {
                              resp.error("promise failed because: "+reason);
                          });                      
                    });
                    resp.success(data); 
                }
              });
        }
        else{          
          msg.message = "No changes."
          resp.success(JSON.stringify(msg)); 
        }
      }
      else{          
          msg.message = " Gateway Id not found."
          resp.success(JSON.stringify(msg)); 
      }
    }
    // To returns the each gateway data including sensors data.
    else{
        
        var DATA={};
        var query = ClearBlade.Query({collectionName: devices_metadata});
          processQuery(query)
          .then(function (data) {
            //finalObj.gatewaysList=gatewaysList;
            // var final_data = [];

            //TODO for loop with async calls, resp.success maybe called before before call returns
            getDevicesSensorData(data).then(function (final_data) {
              DATA.gateway = final_data;
              
            }, function (reason) {
                resp.error("promise failed because: "+reason);
            });
            }, function (reason) {
                resp.error("promise failed because: "+reason);
            }
          );     
          resp.success(DATA);       
    }
 
}