function TestService(req, resp) {
  ClearBlade.init({request:req});
  var reqObj = req.params;
  var cusQuery = ClearBlade.Query({collectionName:"Customer"});
  if (typeof reqObj.customer_id =="undefined" ){
    cusQuery.equalTo("item_id",reqObj.customer_id);
  }
  processQuery(cusQuery).then(function (data) {
    resp.success(data);
  }, 
  function (reason) {
      resp.error("Customer data fetching error : "+JSON.stringify(reason) );
  });
}
