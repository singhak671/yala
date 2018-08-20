const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
let transactionSchema = new Schema({
})
createTeamInComp.plugin(paginate);
var transaction=mongoose.model("transaction",transactionSchema)
module.exports={
    transaction:transaction
}