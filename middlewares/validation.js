const  validator = require('validator');
const responseCode = require('../helper/httpResponseCode')
const responseMsg = require('../helper/httpResponseMessage');
const mongoose = require('mongoose');
const User=require("../models/user");

const Response = require("../global_functions/response_handler")
module.exports = {
    validate_all_request:  (request_body, require_parameter,inner_parameters,direct_body_parameters) => {       
        function inner_paramater_function(data){
            console.log(data) ;               
            for (let key of inner_parameters){                  
            if(!data[key])
                return [responseCode.BAD_REQUEST,`"${key}" field is required`];
            }
        }
        

        if(direct_body_parameters){
            for (let data of direct_body_parameters){                  
                if(!request_body[data])
                    return [responseCode.BAD_REQUEST,`"${data}" field is required`];
                }
        }
        for (let require_key of require_parameter) {          
            switch (require_key) {
            case 'email':
                if (!request_body['email']){                  
                    return [responseCode.BAD_REQUEST,responseMsg.EMAIL_IS_REQ];
                }
                // else {                                    
                //     if(!validator.isEmail(request_body['email'])){
                //         return [responseCode.BAD_REQUEST,responseMsg.CORRECT_EMAIL_ID];
                //     }
                //     return false;
                // }
                break;
            case 'newPassword':
            if (!request_body['newPassword']) {
                return [responseCode.BAD_REQUEST, "New password is required."];
            }
            break;
            case 'confirmPassword':
            if (!request_body['confirmPassword']) {
                return [responseCode.BAD_REQUEST,"Confirm password is required."];
            }
            break;
            case 'oldPassword':
            if (!request_body['oldPassword']) {
                return [responseCode.BAD_REQUEST, "Old password is required."];
            };
            break;
            case 'password':
                  if(!request_body['password']){
                      return [responseCode.BAD_REQUEST,responseMsg.PASS_IS_REQ]
                  }
                
                break;
            case 'otp':
                if(!request_body['otp']){
                    return [responseCode.BAD_REQUEST,responseMsg.OTP_IS_REQ]
                }
                break;
            case 'role':
            if(!request_body['role']){
                return [responseCode.BAD_REQUEST,responseMsg.ROLE_IS_REQ]
            }
            break;
            case 'userId':
            if(!request_body['userId']){
                return [responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ]
            }
            break;
            case 'cardDetails':
            if(!request_body['cardDetails'])
                return [responseCode.BAD_REQUEST,"Card Details Required"];
            return inner_paramater_function(request_body['cardDetails']);            
            break;
            case 'competitionDetails':
            if(!request_body['competitionDetails'])
                return [responseCode.BAD_REQUEST,"competitionDetails Required"];
            return inner_paramater_function(request_body['competitionDetails']);
            break;

            case "fileDetails":
                if(!request_body["fileDetails"])
                    return[responseCode.BAD_REQUEST,"fileDetails object is required"]
                return inner_paramater_function(request_body["fileDetails"]);

            case "prizeDetails":
                if(!request_body["prizeDetails"])
                    return[responseCode.BAD_REQUEST,"prizeDetails  object is required"];
                return inner_paramater_function(request_body["prizeDetails"]);


            case "standingDetails":
                if(!request_body["standingDetails"])
                    return[responseCode.BAD_REQUEST,"standingDetails object is required"];
                return inner_paramater_function(request_body["standingDetails"]);

            case "criterias":{
                if(!request_body["criterias"])
                    return[responseCode.BAD_REQUEST,"criterias object is required"];
                return inner_paramater_function(request_body["criterias"]);
            }

            case "teamFields":{
                if(!request_body["teamFields"])
                    return [responseCode.BAD_REQUEST,"teamFields object is required"];
                for(let data of request_body["teamFields"]){ 
                    // console.log("i am here >>>>>",)                   
                    for (let key of inner_parameters){                  
                        if(!data[key])
                            return [responseCode.BAD_REQUEST,`"${key}" field is required`];
                        }                
                }
            }
            break;

            case "playerFields":{
                if(!request_body["playerFields"])
                    return [responseCode.BAD_REQUEST,"playerFields object is required"];
                for(let data of request_body["playerFields"]){ 
                    // console.log("i am here >>>>>",)                   
                    for (let key of inner_parameters){                  
                        if(!data[key])
                            return [responseCode.BAD_REQUEST,`"${key}" field is required`];
                        }                
                }
            }
            break;
        }
    }
},
validate_subscription_plan:(request_body,access_parameters,callback)=>{
    if(access_parameters){
           
        User.findOne({_id:request_body.userId,role:"ORGANIZER"},(err,success)=>{
           // console.log("i am success>>>>",success)
            if(err)
                return callback(err,[responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err]);
            else if(!success)
                return callback(err,[responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS]);
            else{
                console.log(success.subscriptionAccess,"d$$$$$$$>>>>",access_parameters);
           
                for(let data of access_parameters)
                    if(success.subscriptionAccess.indexOf(data)==-1){
                        console.log(" I HAV COME");
                            return callback(err,[responseCode.BAD_REQUEST,`"${data}" is not accessible by you !`]);
                    }
                    callback(err,[responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE]);
            }

        })

    }
}
}   
