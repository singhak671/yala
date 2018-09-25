const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;

//product Schema
let productSchema = new Schema({
    organizerId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    competitionDetail: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'competition',
            default: null
        },
        competitionName: {
            type: String
        },
    },
    membershipDetail: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'orgmembership',
            default: null
        },
        membershipName: {
            type: String
        },
    },
    productType : {
      productType: String, 
      replicateTo: String, 
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'configureProduct'
      }
    },
    description: {
        type: String
    },
    productImage: {
        public_id: String,
        url: String
    },
    price_size_qunatity: [
        {
            size: String,
            price: Number,
            quantity: Number
        }
    ],
    visibleStatus: {
        type: String,
        default: "ACTIVE"
    }
}, {
        timestamps: true
    });
    productSchema.index({ first: 1, last: -1 })

productSchema.plugin(paginate);
productSchema.plugin(mongooseAggregatePaginate);

const product = mongoose.model('product', productSchema);

//Configure product schema
let configureProductSchema = new Schema({
    productType: {
        type: String
    },
    replicateTo: {
        type: String
    },
    organizerId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },

}, {
        timestamps: true,
    })
configureProductSchema.plugin(paginate);
const configureProduct = mongoose.model("configureProduct", configureProductSchema);

mongoose.model("configureProduct", configureProductSchema).find({ "productType": "Tshirt", productType: "Medal", productType: "Trouser" }, (err, result) => {
    console.log("@@@@@@@@@")
    if (err)
        console.log("error---->>>", err)
    else if (!result.length) {
        let obj = [
            {
                productType: "Tshirt",
                organizerId: null,
                replicateTo: "Tshirt"
            },
            {
                productType: "Trouser",
                organizerId: null,
                replicateTo: "Trouser"
            },
            {
                productType: "Medal",
                organizerId: null,
                replicateTo: "Medal"
            },
        ]

        mongoose.model("configureProduct", configureProductSchema).create(obj, (error, success) => {
            if (error)
                console.log("Error is" + error)
            else
                console.log("Static content saved succesfully.");
        })
    }
    else
        console.log("############")
})




module.exports = {
    "product": product,
    "configureProduct": configureProduct

}