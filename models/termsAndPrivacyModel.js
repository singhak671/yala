const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const termsPrivacySchema = new Schema({
    PLAYER:{
        termsAndConditions: {
            type: String
        },
        privacyPolicy: {
            type: String
        },
        role:{
           type:String,
           default:"PLAYER"
        }
    },
    ORGANIZER:{
        termsAndConditions: {
            type: String
        },
        privacyPolicy: {
            type: String
        },
        role:{
           type:String,
           default:"ORGANIZER"
        }
    },
    VENUE:{
        termsAndConditions: {
            type: String
        },
        privacyPolicy: {
            type: String
        },
        role:{
           type:String,
           default:"VENUE"
        }
    }
    
},{
    timestamps: true
});

mongoose.model('termsAndPrivacy',termsPrivacySchema).findOne({"PLAYER.role":"PLAYER"},(err,result)=>{
    console.log("")
    if(err)
    console.log("error---->>>",err)
    else if(!result)
    { 
        console.log("result--->>",result)
        let obj = {
            PLAYER:{
            termsAndConditions: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            privacyPolicy: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            role:"PLAYER"
        },
        ORGANIZER:{
            termsAndConditions: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            privacyPolicy: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            role:"ORGANIZER"
        },
        VENUE:{
            termsAndConditions: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            privacyPolicy: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostr
            ud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pari
            atur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            role:"VENUE"
        }
    }
          
        mongoose.model('termsAndPrivacy',termsPrivacySchema).create(obj,(error,success)=>{
            if(error)
                console.log("Error is"+ error)
            else
                console.log("Static content saved succesfully.");
        })
    }
    else
        console.log("")
})

module.exports = mongoose.model('termsAndPrivacy',termsPrivacySchema);







// mongoose.model('Users',userSchema).findOne({type:"SUPERADMIN"}, (err,res)=>{
//     if(!res){
//         let obj = { 
//                 firstName: "Shiva",
//                 lastName: "Kesarwani",
//                 password: "admin1234",
//                 type: "SUPERADMIN",
//                 email: "shiva.kesarwani@mobiloitte.in",
//                 contact: "+918081663629"
//         };
//         var pass;
//         const saltRounds = 10;
//         bcrypt.genSalt(saltRounds, (err1,salt) => {
//             bcrypt.hash(obj.password, salt, (err2,hash)=>{
//                 obj.password = hash;
//                 mongoose.model('Users',userSchema).create(obj, (error, success) => {
//                     if(error)
//                         console.log("Error is"+ error)
//                     else
//                         console.log("User saved succesfully.");
//                 })
//             })
//         });
//     }
// });