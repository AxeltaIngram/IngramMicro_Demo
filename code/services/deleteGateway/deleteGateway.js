
 /**
  * @type{object} _resp -  responseMessage
  * @type{string} auth_token - imonnit super user auth token
  */ 
var _resp;
//TODO: token in constant library
var auth_token = superUser_auth;
//TODO Using libraries and helper functions would be better, as system scales debugging might become a challenge
//TODO update what in gateway is not obvious until I look at the code, same for reform

/**
 *  @typedef deleteGateway
 *  UPDATE/REFORM/DELETE  Gateway in Imonnit and Clearblade platform
 *  @param {object} req - request object. It contains method,gateway_id,auth_token parameters
 *  @param {string} req.params.method -  update/reform/remove .
 *  @param {number} req.params.gateway_id - Gateway Id.
 *  @param {string} req.params.auth_token - user auth token
 *  @param {object} resp - response object.
 *  @returns {String} returns update/reform/remove  operation status "success (or) ERROR message "
 * 
 */
function deleteGateway(req, resp) {
  
  ClearBlade.init({ request: req });
  var reqObj = req.params;
  callDeleteGateWayService(reqObj).then(function(response){
    resp.success(response);
  },function(reason){
      response.error(reason);
  }); 
}