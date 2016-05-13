var stripeLib = require("stripe");

function missesRequirements(obj, req){
  var missing = [];
  for(var r of req){
    if(!obj[r]) {
      missing.push(r);
    }
  }
  return missing.length ? missing : false;
}

var getToken = function(stripeCredentials) {
    return new Promise(function(resolve, reject) {
        
        var required = [
            "stripe_secret",
            "credit_card_number",
            "credit_card_cvc",
            "credit_card_expiry_month",
            "credit_card_expiry_year"
        ];

        var missingRequirements = missesRequirements(stripeCredentials, required);
        if(missingRequirements){
            reject("Stripe missing required fields: " + JSON.stringify(missingRequirements));
        } else {
            if (stripeCredentials.stripe_secret.indexOf("sk") === 0) {
                console.log("*** WARNING: using a secret strip key. ***");
            }

            var stripe = stripeLib(stripeCredentials.stripe_secret);


            var card = {
                number : stripeCredentials.credit_card_number,
                exp_month : stripeCredentials.credit_card_expiry_month,
                exp_year : stripeCredentials.credit_card_expiry_year,
                cvc : stripeCredentials.credit_card_cvc
            };

            stripe.tokens.create({ card : card },
                (err, token) => {
                    if(err) reject(err);
                    else resolve(token.id);
                }
            );
        }

    });
};

module.exports = {
    getToken : getToken
};
