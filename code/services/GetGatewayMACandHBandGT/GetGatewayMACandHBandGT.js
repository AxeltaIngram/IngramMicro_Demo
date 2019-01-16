/**
 * @type{object} cresp - global response object 
 * @type{number} gateway_id - store gatewayID from request object
 * @type{string} user_name - store user_name from request object
 * @type{string} pwd URI - store pwd from request object
 * @type{object} reqObj - store request object
 */
var cresp,gateway_id,user_name,pwd,reqObj;
var auth_key_service="getImAuthKey";

/**
 * @typedef GetGatewayMACandHBandGT
 * To get gateway MAC address,HeartBeat and gatewayType from imonnit
 * @param {object} req - request object
 * @parm {object} resp - response object
 */
function GetGatewayMACandHBandGT(req, resp) {
  ClearBlade.init({request:req});
  cresp=resp;
  reqObj=req.params;
  
  if(reqObj.hasOwnProperty("gateway_id")&&reqObj.hasOwnProperty("username")&&reqObj.hasOwnProperty("password"))
  {
   
  gateway_id=reqObj.gateway_id;
  user_name = reqObj.username;
  pwd = reqObj.password;
    immonit.init(user_name, pwd).then(function(authres){
        //TODO: getGatewayDetails should be in the library
        getGatewayDetails(false,authres);
    });

//   var serviceObj={
//     "username":user_name,
//     "password":pwd
//   };
//   ClearBlade.Code().execute(auth_key_service,serviceObj,false,getGatewayDetails);

  }else{
  resp.success('Request Object should contain gateway_id,username,password');
  }
}


/**
 * @callback getGatewayDetails
 * TODO: invoke GetGateway API of imonnit and returns gateway details object
 * @param {object} err - error object
 * @parm {object} authres - response from getAuthKey service
 */
function getGatewayDetails(err,authres)
{
  if(err)
  {
    cresp.error(err);
  }else{

  var requestObject = Requests();
  if(gateway_id === 913201)
  {
    var URI = imonnit_uri+"/JSON/GatewayGet/"+authres+"?gatewayID="+gateway_id;
  }else{
    var URI = imonnit_uri2+"/JSON/GatewayGet/"+authres+"?gatewayID="+gateway_id;
  }  
    var options = {
        uri:URI
    }
    returnMethod(URI).then(function(result){
        cresp.success(result);
    }, function (reason) {
        resp.error("returnMethod() failed..! : " + reason);
    });
  }
}
