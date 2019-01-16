/**
 * 	@typedef UUIDgenerator
 *  TODO: generate UUID 
 *  @param {object} req - request object.It contains network_ID parameter.
 *  @param {object} resp - response object.
 *  @param {number} network_ID - network_ID.
 *	@returns {UUID} returns generated UUID 
 **/
var encryptFormat = crypto.createHash("md5");
function UUIDgenerator(req, resp) {
 
  var givenNID=req.params.network_ID;
  var result= generateUUID(givenNID);
  resp.success(result);
}

/**
 * 	@typedef generateUUID
 *  TODO: generate UUID 
 *  @param {string} network_ID - network_ID.
 *	@returns {UUID} returns generated UUID 
 **/
function generateUUID(inputstr){
	encryptFormat.update(inputstr);
  var encryptedString = encryptFormat.digest("hex");
  encryptedString = encryptedString.slice(0, 8) + "-" + encryptedString.slice(8, 12) + "-" + encryptedString.slice(12, 16)+"-" + encryptedString.slice(16, 20)+"-" + encryptedString.slice(20, 32);
  return encryptedString;
}