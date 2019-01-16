function TestingWithMessagePublisher(req, resp) {
     ClearBlade.init({request:req});
  var msg = ClearBlade.Messaging();
  const payload = {};
  payload.time = (new Date()).toString();
  msg.publish("cbpub/1", JSON.stringify(payload));
  log(payload);
  resp.success('Success');
}
