const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
//Team Schema
let teamSchema = new Schema({ 
  
   orgId:{
    type:Schema.Types.ObjectId
    },
   name:{
    type:String
    },
    phoneNumber:{
        type:String
    },
    email:{
        type:String
    },
    venue:{
        type:String
    },
    competition:{
       type:String
    },
    category:{
        type:String
    },
    status:{
        type:String,
       enum:["ACTIVE","PENDING","InProgress"],
       default:"InProgress"
    },
    sports:{
        type:String
    }
    
}, {
    timestamps: true
});
teamSchema.plugin(paginate);
const team = mongoose.model('team', teamSchema);

//Player Schema
let playerSchema= new Schema({
    orgId:{
        type:Schema.Types.ObjectId
    },
    name:{
        type:String
    },
    team:{
        type:String
    },
    phone:{
         type:String
    },
    email:{
        type:String
    },
    residence:{
        type:String
    },
    birthday:{
        type:Date
    },
    gender:{
        type:String
    },
    status:{
        type:String
    },
    sports:{
        type:String
    }

},
{
    timestamps:true
})

playerSchema.plugin(paginate);
const player = mongoose.model('player', playerSchema);

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
        orgId:{
            type:Schema.Types.ObjectId
        },
        name:{
            type:String
        },
        phone:{
            type:String
        },
        email:{
            type:String
        },
        dob:{
            type:Date
        },
        gender:{
            type:String,
           enum:["Male","Female"],
        },
        activities:{
            type:String
        }
        },{
        timestamps:true
        })
    
    refereeSchema.plugin(paginate);
    const referee=mongoose.model('referee',refereeSchema)
       
     //Venue Schema
    let venueSchema=new Schema({
            orgId:{
                type:Schema.Types.ObjectId
            },
            venue:{
                type:String
            },
            status:{
                type:String
            },
            club:{
                type:String
            }
            },{
            timestamps:true
            })
        
     venueSchema.plugin(paginate);
     const venue=mongoose.model('venue',venueSchema)

     //Sponsers
    let sponserSchema=new Schema({
                orgId:{
                    type:Schema.Types.ObjectId
                },
                sponserName:{
                    type:String
                },
                link:{
                    type:String
                },
                descriptition:{
                    type:String
                },
                position:{
                  type:String
                },
                visibleIn:{
                      type:String
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
            
     sponserSchema.plugin(paginate);
     const sponser=mongoose.model('sponser',sponserSchema)
    
         module.exports={
                "team":team,
                "player":player,
                "club":club,
                "referee":referee,
                "venue":venue,
                "sponser":sponser
         }

