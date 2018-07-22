const twilio = require("twilio");
const mailer = require('nodemailer');
const config = require("../config/config");
var waterfall = require('async-waterfall');
var cloudinary = require('cloudinary');
var fs = require('fs');

cloudinary.config({ 
    cloud_name: config.cloudinary.cloud_name, 
    api_key: config.cloudinary.api_key, 
    api_secret:config.cloudinary.api_secret 
  })
module.exports = {
    //     sendSMS: (message, number, callback) => {

    //         let client = new twilio(config.twilio.sid, config.twilio.auth_token);
    //         client.messages.create({
    //                 body: message,
    //                 to: "+91"+number, // Text this number
    //                 from: config.twilio.number // From a valid Twilio number
    //             })
    //             .then((message) => {
    //                 console.log("@@@@@@@@@@@@@@@@@@",message);
    //                 callback(null, message.sid);
    //             })
    //             .catch((response) => {
    //                 callback(response);
    //             })
    // },
    sendSMS: (message,code,number, callback) => {
        var a=52;
                    let client = new twilio(config.twilio.sid, config.twilio.auth_token);
                    client.messages.create({
                            body: message,
                            to: code+number, // Text this number
                            from: config.twilio.number // From a valid Twilio number
                        })
                        .then((message) => {
                            console.log("@@@@@@@@@@@@@@@@@@",message);
                            callback(null, message.sid);
                        })
                        .catch((response) => {
                            callback(response);
                        })
            },
    getOTP: () => {
    var val = Math.floor(100000 + Math.random() * 9000);
    console.log(val);
        return val;
        
    },
    sendMail: (email, subject, text, callback) => {

        const mailBody = {
            from: "<do_not_reply@gmail.com>",
            to: email,
            subject: subject,
            html: text,
            //  html: "<p>Your verification code is " + otp + "</p>"
        };

        mailer.createTransport({
            service:'GMAIL',
            auth: {
                user: config.nodemailer.user,
                pass: config.nodemailer.pass
            },
            port: 587,
            host: 'smtp.gmail.com'

        }).sendMail(mailBody, callback)
    },

    uploadImg:(pdf_base64, cb)=> {
             cloudinary.uploader.upload(pdf_base64,function(result) {
                console.log("image url-->" , result.url);
                if(result)
                     cb(null,result)       
                else
                    cb(true,null)},{resource_type: 'auto',
            });        
        },
   
    editUploadedFile:(pdf_base64,publicId, cb)=> {
            console.log("Iiiiiddddd>>>>>",publicId);
                     cloudinary.uploader.upload(pdf_base64,function(result) {
                         console.log("image url-->" , result);
                         if(result)
                              cb(null,result)       
                         else
                             cb(true,null)},{resource_type: 'auto',public_id:publicId
                     });                 
             },
    deleteUploadedFile:(publicId,cb)=>{
        console.log("Iiiiiddddd>>>>>",publicId);

        cloudinary.uploader.destroy(publicId,function(result) {
            console.log("result",result);
            if(result)
                 cb(null,result);       
            else
                cb(true,null)
        })
    }
}

// "twilio":{
//     "sid": "AC1ebd62cd860da196db5807f53709d87e",
//     "auth_token": "451f53b7830e5966638e9d283441d42e",
//     "number":"+18316618705"
// },