//To store the data into CB when adapter publishes MQTT message
//TODO: Refer this for documenting constants http://usejsdoc.org/tags-constant.html

var _resp, _req, reqObj, sensorObj, gatewayObj,count;
/**
 * @typedef imonnitDeviceData
 *  @param {object} req - monnit-webhook-adapter/sensorID message object
 *  @param {object} resp - response object.
 *  TODO : Stores new gateway/network/sensors details into devices_metadata,gateways_data,sensors_data and Sensors collections
 */

function imonnitDeviceData(req, resp) {

    ClearBlade.init({ request: req });
    _resp = resp;
    _req = req;
    log("Adapter Msg: " + req.params.body);
    var d = new Date();

    reqObj = stringToJSONConveter(req.params.body); 
     if(reqObj.hasOwnProperty("gateway_message") && reqObj.hasOwnProperty("sensor_message"))
     {
    gatewayObj = reqObj.gateway_message;
    sensorObj = reqObj.sensor_message;
     }else{
         resp.error("Required parameters are missing");
     }
    log("Sensor value " + sensorObj.sensorID);
    if (gatewayObj.networkID != sensorObj.networkID) {
        var unrSnObj = {
            "device_id": parseInt(sensorObj.sensorID),
            "network_id": parseInt(sensorObj.networkID),
            "device_name": sensorObj.sensorName,
            "sensor_reading": sensorObj.dataValue,
            "battery_level": parseInt(sensorObj.batteryLevel),
            "signal_strength": parseInt(sensorObj.signalStrength),
            "reading_time": sensorObj.messageDate
        };
        createNewRecord(unrevealedDevicesData, unrSnObj,3);
    } else {

        var gatewayMsgObj = {
            "gateway_id": parseInt(gatewayObj.gatewayID),
            "network_id": parseFloat(gatewayObj.networkID),
            "gateway_name": gatewayObj.gatewayName,
            "battery_level": parseInt(gatewayObj.batteryLevel),
            "signal_strength": parseInt(gatewayObj.signalStrength),
            "reading_date": gatewayObj.date
        };
        var sensorMsgObj = {
            "sensor_id": parseInt(sensorObj.sensorID),
            "sensor_name": sensorObj.sensorName,
            "sensor_reading": sensorObj.dataValue,
            "battery_level": parseInt(sensorObj.batteryLevel),
            "signal_strength": parseInt(sensorObj.signalStrength),
            "reading_time": sensorObj.messageDate
        };

        createNewDevice(devices_metadata, reqObj);
        //to store Gateway Data
        var gcquery = ClearBlade.Query({ collectionName: gateways_data });
        var cdate = gatewayObj.date;
        gcquery.equalTo("reading_date", cdate);
        gcquery.equalTo("gateway_id", parseInt(gatewayObj.gatewayID));
        gcquery.fetch(function (err, data) { 
            if (err) {
                resp.error("error: " + data)
            } else {
                if (data.TOTAL === 0) {
                    createNewRecord(gateways_data, gatewayMsgObj,1);
                }
 //to store sensor details in Sensors collection
        var sensorDetailsQuery = ClearBlade.Query({ collectionName: Sensors });
        sensorDetailsQuery.equalTo("sensor_id", sensorMsgObj.sensor_id);
        sensorDetailsQuery.fetch(function (err, data) {
            if (err) {
                resp.error("error: " + data)
            } else {
                if (data.TOTAL === 0) {
                    createNewRecord(Sensors,
                        {
                            "sensor_id": sensorMsgObj.sensor_id,
                            "sensor_name": sensorMsgObj.sensor_name,
                            "gateway_id": gatewayMsgObj.gateway_id
                        },2);
                }
                //to store sensor data
                createNewRecord(sensors_data, sensorMsgObj,3);
                //s-data end
            }
        });
        //sensors end
            }
        });

    }

    //final response    
   // _resp.success("success");
}
//Create a record in specified collection
/**
 * @typedef createNewRecord
 * Creates new item in given collection with gives values 
 * @param {string} tbl - into which collection data is getting stored
 * @param {json} values - object to store into collection
 **/
function createNewRecord(tbl, values,countValue) {
    var col = ClearBlade.Collection({ collectionName: tbl });
    col.create(values, statusCallBack);
    if(countValue === 3)
    {
      sendResponse();  
    }
}
/**
 * @typedef createNewDevice
 * @param {string} collectionName - into which collection data is getting stored
 * @param {json} deviceObj - object to store into collection
 * Do querying for network_id in request object and call deviceCallBack function 
 **/
function createNewDevice(collectionName, deviceObj) {

    var networkId, gatewayId, sensorId;

    networkId = deviceObj.gateway_message.networkID;
    gatewayId = deviceObj.gateway_message.gatewayID;
    sensorId = deviceObj.sensor_message.sensorID;

    var query = ClearBlade.Query({ collectionName: collectionName });
    query.equalTo("network_id", deviceObj.gateway_message.networkID);
    query.fetch(deviceCallBack);
}



//add new gateways and networks
/**
 * @typedef createGateways
 * Creates new item in devices_metadata collection 
 **/
function createGateways() {
    var networkUUID=generateUUID(parseInt(gatewayObj.networkID));
    var newDeviceObj = {
        "network_id": parseInt(gatewayObj.networkID),
        "network_uuid": networkUUID,
        "gateway_id": parseInt(gatewayObj.gatewayID),
        "gateway_name": gatewayObj.gatewayName,
        "sensors": JSON.stringify({ "sensorsList": [sensorObj.sensorID] }),
        "customer_name": JSON.stringify({ "users": ["ingram@axelta.com", "usman.minhas@ingrammicro.com"] })
    };
    log(newDeviceObj);
    var devicesMetaData = ClearBlade.Collection({ collectionName: devices_metadata });
    devicesMetaData.create(newDeviceObj, devicestatusCallBack);
}

//device data query callback
/**
 * @typedef deviceCallBack
 * It is a callback function.It checks gateway existancy in devices_metadata collection.If it is there it modifies item,if not it creates new item. 
 **/
var deviceCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
        _resp.error(data);
    } else {
        var queryResult = data;
        queryResult = queryResult.DATA
        log(data);

        if (queryResult.length > 0) {
            for (var i = 0; i < queryResult.length; i++) {
                log(i + " " + queryResult.length + " " + parseInt(gatewayObj.gatewayID) + " " + queryResult[i].gateway_id)
                if (queryResult[i].gateway_id === parseInt(gatewayObj.gatewayID)) {
                    var listOfSensors = JSON.parse(queryResult[i].sensors).sensorsList;
                    if (listOfSensors.indexOf(sensorObj.sensorID) < 0) {
                        listOfSensors.push(sensorObj.sensorID);
                        log(listOfSensors);
                        var query = ClearBlade.Query();
                        query.equalTo('gateway_id', parseInt(gatewayObj.gatewayID));
                        var changes = {
                            sensors: JSON.stringify({
                                "sensorsList": listOfSensors
                            })
                        };

                        var sensorUpdateObj = ClearBlade.Collection({ collectionName: devices_metadata });
                        sensorUpdateObj.update(query, changes, devicestatusCallBack);
                    }
                    break;
                } else {
                    if (i === queryResult.length - 1) {
                        createGateways();
                    }
                }
            }
        } else {

            createGateways();
        }
        //_resp.success(data);
    }
};

/**
 * @typedef statusCallBack
 * It is a callback function. 
 **/
var statusCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
        _resp.error(data);
    } else {
        log(data);

        //_resp.success(data);
    }
};

/**
 * @typedef devicestatusCallBack
 * It is a callback function. 
 **/
var devicestatusCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
        _resp.error(data);
    } else {
        log(data);

        //_resp.success(data);
    }
};

var sendResponse=function(){
//final response    
   _resp.success("success");
};