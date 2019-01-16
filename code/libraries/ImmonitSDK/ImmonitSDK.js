// TODO: Update this skeleton code, this is just an example of how it needs to be implemented. 
// refer: https://github.com/yashjain28/gcloud-bigquery/blob/master/code/libraries/BigQuery/BigQuery.js
function Immonit(){
    var resp ;
    var immonit_base_uri = "http://40.86.214.108";;
    var auth_token = "";
    function init(username, password){
        var URI;
        var deferred = Q.defer();
       //To get Imonnit user Authentication key
        var requestObject = Requests();
        if(username !=="Axelta"){
            URI = imonnit_uri2+"/json/GetAuthToken?username="+username+"&password="+password;
        }else{
            URI = imonnit_uri+"/json/GetAuthToken?username="+username+"&password="+password;
        }
        // URI = immonit_base_uri + "/json/GetAuthToken?username="+username+"&password="+password;
        requestObject.get({uri:URI},function(err, data){
            if(err){
                deferred.reject(err);
            }
            else{
                var result_data  = stringToJSONConveter(data);
                deferred.resolve(result_data.Result);                           
            }
        });
        return deferred.promise;
    }
    function Gateway(gatewayID){
        function Update(auth_token){
            var URI;
            if (gatewayID !== 913201) {
                URI =imonnit_uri2+update_url+auth_token+"?gatewayID="+gatewayID;
            } else {
                URI =imonnit_uri+update_url+auth_token+"?gatewayID="+gatewayID;
            }
            return returnMethod(URI);
        }
       
        function Remove(auth_token){
            if (gatewayID !== 913201) {
                URI =imonnit_uri2+remove_url+auth_token+"?gatewayID="+gatewayID;
            } else {
                auth_token=ax_auth;
                URI =imonnit_uri+remove_url+auth_token+"?gatewayID="+gatewayID;
            }
            return returnMethod(URI);
        }
        function Reform(auth_token){
            if (gatewayID !== 913201) {
               URI =imonnit_uri2+reform_url+auth_token+"?gatewayID=" + gatewayID;
            } else {
                URI =imonnit_uri+reform_url+auth_token+"?gatewayID=" + gatewayID;
            }
            return returnMethod(URI);
        }
        // add more functions here if required, and return a promise... same goes for Sensor as well 
        return{
            Update,
            Remove,
            Reform
        }
    }
 

    function Sensor(sensorID){ 
        // Pass in any other parameter if required
        function Assign(gateway_id,auth_token,network_id,checkDigit){
            if(gateway_id === 913201){
                URI = imonnit_uri+"/json/AssignSensor/"+auth_token+"?networkID="+network_id+"&sensorID="+sensorID+"&checkDigit="+checkDigit;
            }else{
                URI = imonnit_uri2+"/json/AssignSensor/"+auth_token+"?networkID="+network_id+"&sensorID="+sensorID+"&checkDigit="+checkDigit;
            }
            return returnMethod(URI);
        }
        function Remove(gateway_id,auth_token){
            if(gateway_id === 913201){
                URI = imonnit_uri+"/json/RemoveSensor/"+auth_token+"?sensorID="+sensorID;
            }else{
                URI = imonnit_uri2+"/json/RemoveSensor/"+auth_token+"?sensorID="+sensorID;
            }
            return returnMethod(URI);
        }
        return {
            Assign,
            Remove
        }
    }
    return {
        Gateway,
        Sensor,
        init
    }
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


function returnMethod(URI){
    var deferred = Q.defer();
    immonitResponseNew(URI).then(function(imResult){
        deferred.resolve(imResult);
    }
    ,function(reason){
       deferred.reject(reason);
    }); 
    return deferred.promise;
}
/**
 * Way to use the above library is 
 */
  var immonit = Immonit();
 // immonit.Gateway=Gateway("fgysa");
 