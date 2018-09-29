editAd": function (req, res) {
console.log("Edit Ad Body...", req.body)
if (req.body.promoCode==true) {
    i18n = new i18n_module(req.body.lang, configs.langFile);
    //console.log("edit ad-----*+*+/*+///+*///--->>>",JSON.stringify(req.body))
    createNewAds.update({ _id: req.params.id }, { $set: { promoCode: req.body.promoCode } }).exec(function (err, result) {
        if (err) { res.send({ responseCode: 409, responseMessage: 'Internal server error' }); } else {
            console.log("result edit ad ---->>>", result)
            res.send({
                result: result,
                responseCode: 200,
                responseMessage: i18n.__("1st Ad edit successfully")
            });
        }
    });
} else {
    var gift_code = [];
    var dd = req.body.hiddenGifts.constructor.prototype.hasOwnProperty('push');
    console.log("===================================================trueeeeeeeeeeeeeeeeeeee", dd)
    if (!dd) {
        var str = req.body.hiddenGifts;
        var str_array = str.split(',');
        delete req.body.hiddenGifts;
        req.body.hiddenGifts = str_array;
    }