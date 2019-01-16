/**
 *  @typedef getImAuthKey
 *  get user authentication key from Imonnit 
 *  @param {string} username - User Name.
 *  @param {string} password - Password.
 *  @param {string} auth_token - auth_token. -- optional
 *  @param {string} method -  update/remove. 
 *  @param {number} gateway_id - Gateway Id.
 *  @returns -- if we pass username and password only it returns Authentication token 
 *            -- else it performs  update/remove operation of  passed gateway
 **/
function getImAuthKey(req, resp) {
    ClearBlade.init({request:req});
    var msg={};
    var reqObj = stringToJSONConveter(req.params);
    var username; 
    var password;
  if((reqObj.hasOwnProperty("username")) && (reqObj.hasOwnProperty("password")) && (reqObj.hasOwnProperty("method")) && (reqObj.hasOwnProperty("gateway_id"))){
    username = reqObj.username; 
    password = reqObj.password;
    immonit.init(username,password).then(function(auth_token){
      try{
        log("Req Obj "+ JSON.stringify(reqObj));
        reqObj.auth_token = auth_token;
        callDeleteGateWayService(reqObj).then(function(response){
          log("Req Obj "+ JSON.stringify(response));
          resp.success(response);
        },function(reason){
            response.error(reason);
        });  
      }
      catch(error){
        log(error);
      }   
    },
    function(reason){
        resp.error(reason);
    });
  }
  else{
      //Executes delete service
      if((reqObj.hasOwnProperty("method")) && (reqObj.hasOwnProperty("gateway_id")) )
      {
       // reqObj.auth_token=superUser_auth;
    //    var resObj;
    //     resObj=serviceCall(UpdateorRemoveGateway, reqObj, false,ClearBlade.Code());
       serviceCallPromise(UpdateorRemoveGateway, reqObj, false,ClearBlade.Code())
        .then(function(resObj){
           if(resObj.success){
                resp.success(resObj);
            }else{
                resp.error(resObj);
            }
       });              
      }
    else if((reqObj.hasOwnProperty("username")) && (reqObj.hasOwnProperty("password"))){
        username = reqObj.username; 
        password = reqObj.password;
        immonit.init(username,password).then(function(Result){
            resp.success(Result);
        },
        function(reason){
            resp.error(reason);
        });
    }
      
      else{
        msg.Message="Invalid Parameters";
        resp.error(stringToJSONConveter(msg));
      } 
  }
}
