const twilio = require("twilio");
const mailer = require('nodemailer');
const config = require("../config/config");
var waterfall = require('async-waterfall');
var cloudinary = require('cloudinary');
var FCM = require('fcm-push');
var FCM1 = require('fcm').FCM;
var newArray = [];
var generator = require('generate-password');
const General = require("../models/generalSchema.js")
var fs = require('fs');
const Notification = require('../models/notification.js')
var async = require("async");
cloudinary.config({
    "cloud_name": "singhanurag400",
    "api_key": "646765743427282",
    "api_secret": "HwwLwgp1zjKjZKv8_FCNMB3Vi54"
})
module.exports = {
    
    sendSMS: (message, code, number, callback, userId) => {
        if (userId) {
            General.paymentSms.findOne({ organizer: userId }, { smsDetail: 1 }, (err, success) => {
                console.log(success.smsDetail)
                if (success) {
                    let client = new twilio(success.smsDetail.sid, success.smsDetail.auth_token)
                    client.messages.create({
                        body: message,
                        to: code + number, // Text this number
                        from: success.smsDetail.number // From a valid Twilio number
                    })
                        .then((message) => {
                            console.log("@@@@@@@@@@@@@@@@@@", message);
                            callback(null, message.sid);
                        })
                        .catch((response) => {
                            console.log(response)
                            callback(response);
                        })
                }
            })
        }
        else {
            console.log("Mobile number", code + number)
            var a = 52;
            let client = new twilio(config.twilio.sid, config.twilio.auth_token);
            client.messages.create({
                body: message,
                to: code + number, // Text this number
                from: config.twilio.number // From a valid Twilio number
            })
                .then((message) => {
                    console.log("@@@@@@@@@@@@@@@@@@", message);
                    console.log("message sent successfully", message);
                    callback(null, message.sid);
                })
                .catch((response) => {
                    console.log(response)
                    callback(response);
                })
        }

    },
    getOTP: () => {
        var val = Math.floor(100000 + Math.random() * 9000);
        console.log(val);
        return val;

    },
    getPrivateKey: (userId, callback) => {
        General.paymentSms.findOne({ organizer: userId }, { paymentDetails: 1 }, (err, success) => {
            console.log(success)
            if (success) {
                callback(err, success);
            }
        })
    },
    sendMail: (email, subject, text, callback, userId) => {
        console.log("I have comed for email*********************_____________________", email)
        // if(userId)

        const mailBody = {
            from: "<do_not_reply@gmail.com>",
            to: email,
            subject: "Yala Sports App ✔",
            html: text,
            //  html: "<p>Your verification code is " + otp + "</p>"
        };
        if (userId) {
            General.mailMessage.findOne({ organizer: userId }, (err, success) => {
                if (success) {
                    mailer.createTransport({
                        service: 'GMAIL',
                        auth: {
                            user: success.smtpUsername,
                            pass: success.smtpPassword
                        },
                        port: 587,
                        host: 'smtp.gmail.com'

                    }).sendMail(mailBody, callback)
                }
            })
        }

        else {
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", config.nodemailer.user, config.nodemailer.pass);
            mailer.createTransport({
                service: 'GMAIL',

                auth: {
                    user: config.nodemailer.user,
                    pass: config.nodemailer.pass
                },
                port: 587,
                host: 'smtp.gmail.com'

            }).sendMail(mailBody, callback)
        }

    },

    uploadImg: (pdf_base64, cb) => {
        cloudinary.uploader.upload(pdf_base64, function (result) {
            console.log("image url-->", result.url);
            if (result)
                cb(null, result)
            else
                cb(true, null)
        }, {
                resource_type: 'auto',
            });
    },
    genratePassword: () => {
        var password = generator.generate({
            length: 10,
            numbers: true
        });
        console.log("forget password--------->>>>>", password)
        return password;
    },

    editUploadedFile: (pdf_base64, publicId, cb) => {
        console.log("Iiiiiddddd>>>>>", publicId);
        cloudinary.uploader.upload(pdf_base64, function (result) {
            console.log("image url-->", result);
            if (result)
                cb(null, result)
            else
                cb(true, null)
        }, {
                resource_type: 'auto', public_id: publicId
            });
    },
    deleteUploadedFile: (publicId, cb) => {
        console.log("Iiiiiddddd>>>>>", publicId);

        cloudinary.uploader.destroy(publicId, function (result) {
            console.log("result", result);
            if (result)
                cb(null, result);
            else
                cb(true, null)
        })
    },

    sendPushNotifications: (deviceTokens, messageBody, callback) => {

        if (typeof (deviceTokens) == "string") {

            newArray.push(deviceTokens)
            console.log("Device tokens", newArray)
        }
        else {
            newArray = deviceTokens

        }

        var serverKey = 'AAAAQ0w6JT0:APA91bH6-L7dFYkPFneAiwevxN4rFPaewAylGJitQ4RnHVpsF2fuJpJPJ2gnxMJ2VPavo4PIqO8jcN2pWLuF0WCtQVHUjvlbtBcZAbhkkF5C3R5JMuC5ClfrMdocAaqJntGZ1yYYw5s50I-PCtSBQ4Ylk-m06navCA';
        var fcm = new FCM(serverKey);

        var message = {
            //to:deviceTokens,
            registration_ids: newArray,
            //'cObLOr6Y1TE:APA91bEOMRY2_ZhxuZH3pBySfbuQLfd_gZkiUwj9uu7UClOZo6vVr0lUmPxegcrvctLe2AZ9BLZHlgWr-A43TwiAOR8s5rMTVt3xK0_0oTykIHlwmJsCC7FQE7R4pvq1lEwISn2vle_hWGD3_tRavG59D66QS5RB4Q', // required fill with device token or topics
            // collapse_key: 'your_collapse_key', 
            data: {
                "message": messageBody
            },
            notification: {
                title: 'YALA Sports App',
                body: messageBody,
                data: {
                    "message": messageBody
                },
            }
        };

        //callback style
        fcm.send(message, function (err, response) {
            console.log("Push notification detail>>", err, response, deviceTokens);
        });

        //promise style
        // fcm.send(message)
        //     .then(function(response){
        //         callback("Successfully sent with response: ", response);
        //     })
        //     .catch(function(err){
        //        callback("Something has gone wrong!");
        //         console.error(err);
        //     })

    },


    

    sendMailToAll: (maillist, message, callback, userId) => {
        console.log(maillist)
        var mailBody = {
            from: "******", // sender address
            subject: "Yala Sports App ✔", // Subject line
            text: message, // plaintext body
            cc: "*******",
            to: maillist
        }
        if (userId) {
            General.mailMessage.findOne({ organizer: userId }, (err, success) => {
                console.log(success)
                if (success) {
                    mailer.createTransport({
                        service: 'GMAIL',
                        auth: {
                            user: success.smtpUsername,
                            pass: success.smtpPassword
                        },
                        port: 587,
                        host: 'smtp.gmail.com'

                    }).sendMail(mailBody, callback)
                }
                else {
                    console.log("Error while sending message!!!")
                }
            })
        }
        else {
            mailer.createTransport({
                service: 'GMAIL',
                auth: {
                    user: config.nodemailer.user,
                    pass: config.nodemailer.pass
                },
                port: 587,
                host: 'smtp.gmail.com'

            }).sendMail(mailBody, callback)
        }
    },
    sendNotificationToAll: (messageBody, deviceToken) => {
        serverKey = config.serverkey.apiKey
        var fcm = new FCM1(serverKey);
        var message = {
            //registration_id:['ddMQdHYWfB4:APA91bHmiaJtIJAlonDRDEKSlZFi3-6tvvMJ9qRIs_IBRbZakJG1HUgmOZRkHQJ54uVwvcuPXhGHk-cc3AmZL0Cvnnklx5wC7-nQQXQtAiB5D5ttAOR-RkBZI6ZrjLeOD9uh6SttStoN2g2dmETfBpRqTpqUUhtXqQ'], // required
            registration_id: deviceToken,
            notification: {
                title: 'yala Sports App',
                body: messageBody,
                type: "media"
            }
        };
        fcm.send(message, (err, messageId) => {
            console.log(err, messageId)
        })
    },
    saveNotification: (userId, message) => {
        data = userId;
        notification = {
            "title": "yALA App Media",
            "message": message
        }
        console.log(data)
        async.forEach(data, (key) => {
            Notification.findOneAndUpdate({ userId: key }, { $push: { notification: notification } }, { upsert: true, multi: true }, (err, success) => {
                if (err)
                    return console.log(err);
                if (key == data[(data.length - 1)])
                    console.log("Notification Save successfully")

            });
        }, (err) => {
            if (err) console.error(err.message);

        });

    },
    sendSmsToAll: (mobileNumber, body, userId) => {

        if (userId) {
            General.paymentSms.findOne({ organizer: userId }, { smsDetail: 1 }, (err, success) => {
                console.log(success.smsDetail)
                if (success) {
                    let client = new twilio(success.smsDetail.sid, success.smsDetail.auth_token)
                    const numbers = mobileNumber
                    console.log(numbers)
                    Promise.all(
                        numbers.map(number => {
                            return client.messages.create({
                                body: body,
                                to: number, // Text this number
                                from: success.smsDetail.number // From a valid Twilio number
                            });
                        })
                    )
                        .then(messages => {
                            console.log('Messages sent!', messages);
                        })
                        .catch(err => console.error(err));
                }
            })
        }
        else {
            let client = new twilio(config.twilio.sid, config.twilio.auth_token)
            const numbers = mobileNumber
            console.log(numbers)
            Promise.all(
                numbers.map(number => {
                    return client.messages.create({
                        body: body,
                        to: number, // Text this number
                        from: config.twilio.number // From a valid Twilio number
                    });
                })
            )
                .then(messages => {
                    console.log('Messages sent!', messages);
                })
                .catch(err => console.error(err));
        }
    },
}




// "twilio": {
//     "sid": "AC6de757441666da8f511cdee2251d74dc",
//     "auth_token": "3cf7b9a45f8692c5e8fe86da9e0fc382",
//     "number":"(+1814) 277-5455"

// },



// "sid": "ACfb9c8be2a8f6f6ec054ad2eccb215911",
// "auth_token": "cf7330eeba3f29b89b52295d73442189",
// "number":"(+1720) 513-6474"



// "twilio": {
//     "sid": "AC6de757441666da8f511cdee2251d74dc",
//     "auth_token": "3cf7b9a45f8692c5e8fe86da9e0fc382",
//     "number":"(+1814) 277-5455"

// },



// "cloud_name": "singhanurag400", 
// "api_key": "646765743427282", 
// "api_secret": "HwwLwgp1zjKjZKv8_FCNMB3Vi54"



