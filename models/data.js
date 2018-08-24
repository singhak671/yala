const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

//Club Schema
let clubSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId
    },
    clubName:{
        type:String
    },
    phone:{
        type:String
    },
    email:{
        type:String
    },
    headquaters:{
        type:String
    },
    status:{
        type:String,
       default:"Pending"
    },
     image:{
         type:String
     }
    },{
    timestamps:true
    })

    clubSchema.plugin(paginate);
    const club=mongoose.model('club',clubSchema)

    //Referee Schema
let refereeSchema=new Schema({
        userId:{
            type:Schema.Types.ObjectId
        },
        name:{
            type:String
        },
        mobileNumber:{
            type:String
        },
        email:{
            type:String
        },
        dob:{
            type:String
        },
        gender:{
            type:String,
           enum:["Male","Female"],
        },
        activities:{
            type:String
        },
        image:{
            type:String
        }
        },{
        timestamps:true
        })
    
    refereeSchema.plugin(paginate);
    const referee=mongoose.model('referee',refereeSchema)
       
     //Venue Schema
    let venueSchema=new Schema({
            userId:{
                type:Schema.Types.ObjectId
            },
            venue:{
                type:String
            },
            status:{
                type:String
            },
            club:{
                clubName:String,
                clubId:Schema.Types.ObjectId
            },
            image:{
                type:String
            }
            },{
            timestamps:true
            })
        
     venueSchema.plugin(paginate);
     const venue=mongoose.model('venue',venueSchema)

     //Sponsers
    let sponsorSchema=new Schema({
                userId:{
                    type:Schema.Types.ObjectId
                },
                sponsorName:{
                    type:String
                },
                link:{
                    type:String
                },
                description:{
                    type:String
                },
                position:{
                  type:String
                },
                visibleIn:{
                     _id:{type:Schema.Types.ObjectId,ref:"competitions"},
                     competitionName:String,
                     sportType:String
                },
                status:{
                    type:String
                },
                image:{
                    type:String
                }
                },{
                timestamps:true
                })
            
     sponsorSchema.plugin(paginate);
     const sponsor=mongoose.model('sponser',sponsorSchema)
    
         module.exports={
                "club":club,
                "referee":referee,
                "venue":venue,
                "sponsor":sponsor,
         }

