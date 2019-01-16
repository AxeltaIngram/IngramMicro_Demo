/**
 *  @type{string}  _resp  - global Response varible
 *  @type{string} _req    - global Request variable
 *  @type{Array} gatewaysList    - It contains total gateway list
 *  @type{number} user_id    - user id get from request object.
 */

var gatewaysList = [];
var user_id;
var networkuuid;

/**
 *  @typedef GatewayList
 *  get the Gateways data which are accessed by user.
 *  @param {string} networkUUID - send Network UUID.
 *  @param {object} req - request object.It contains networkUUID.
 *  @param {object} resp - response object.
 *  @returns {Object} All Gateways data which are accessed by user.
 **/
// function GatewayList(req, resp) {
function GatewayList(req, resp) {
  try {
    if (req.params.hasOwnProperty("networkUUID")) {
      var reqObj = {};
      reqObj.networkUUID = req.params.networkUUID;
      reqObj.user_id = req.userEmail;
      if (req.params.hasOwnProperty("gatewayID")) {
        reqObj.gatewayID = req.params.gatewayID;
      }
      ClearBlade.init({
        request: req
      });
      var finalObj = {
        "Method": "GatewayList"
      };
      callGatewayListService(reqObj).then(function(gatewaysList) {
        finalObj.Result = gatewaysList;
        resp.success(finalObj);
      }, function(reason) {
        resp.error(reason);
      });
    } else {
      resp.error("Invalid parameters !");
    }
  } catch (error) {
    log("Error in GatewayList() : " + error);
 }
}