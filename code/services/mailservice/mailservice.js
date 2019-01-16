
function mailservice(req, resp) {
 // function sendMailGmail(req, resp){
    var transport = mailer().createTransport({
        host:"smtp.gmail.com",
        port:"587"
    });
    log(req);
    function sendEmail(requestObj){
        transport.sendMail({
            from: fromAddr,
            password:mail_pwd,
            to: "subhash@axelta.com",
            subject: "Test subject",
            text: "Hi. How are you doing today?"
        }, function(error, response){
            transport.close();
            if(error){
                resp.error(error);
            }else{
                resp.success("Thank you "+req.params.firstName+" "+req.params.lastName+".  Your request has been submitted");
            }
        });
    }
    
    ClearBlade.init({request:req});
    sendEmail();
//};	
}
