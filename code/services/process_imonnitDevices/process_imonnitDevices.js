var tbl="device_data";
var _resp, _req;
function process_imonnitDevices(req, resp) {
    ClearBlade.init({request:req});
    _resp=resp;
    _req=req;
    log(req);

//    createRecord(tbl, JSON.parse("{\"SensorID\":\"322983\",\"ApplicationID\":\"93\",\"CSNetID\":\"36102\",\"SensorName\":\"Current Meter 20 Amp - 322983\",\"LastCommunicationDate\":\"7/27/2018 3:15:16 AM\",\"NextCommunicationDate\":\"7/27/2018 5:15:16 AM\",\"LastDataMessageMessageGUID\":\"549a356a-f455-472d-af95-bd59388e98a1\",\"PowerSourceID\":\"15\",\"Status\":\"0\",\"CanUpdate\":\"True\",\"CurrentReading\":\"0 Ah\",\"BatteryLevel\":\"100\",\"SignalStrength\":\"100\",\"AlertsActive\":\"True\",\"CheckDigit\":\"WDUD\",\"AccountID\":\"17324\",\"MonnitApplicationID\":\"93\"}"));
    createRecord(tbl, JSON.parse(req.params.body));
}


//Create a record
function createRecord(tbl, values) {
    var col = ClearBlade.Collection( {collectionName: tbl } );
    col.create(values, statusCallBack);
}

//Shared Status Callback
var statusCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
    	_resp.error(data);
    } else {
        log(data);
    	_resp.success(data);
    }
};
