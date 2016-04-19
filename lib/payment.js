var stripeLib = require("stripe");


var getToken = function(stripeCredentials) {
  console.log(stripeCredentials);

	return new Promise(function(resolve, reject) {
		
		if (stripeCredentials.stripe_secret.indexOf("sk") == 0) {
			console.log("*** WARNING: using a secret strip key. ***");
		}

		var stripe = stripeLib(stripeCredentials.stripe_secret);

		stripe.tokens.create({
		  card: {
		    "number": stripeCredentials.credit_card_number,
		    "exp_month": stripeCredentials.credit_card_expiry_month,
		    "exp_year": stripeCredentials.credit_card_expiry_year,
		    "cvc": stripeCredentials.credit_card_cvc
		  }
		}, function(err, token) {
		  if (err) {
        console.log(err);
		  	reject(err);
      }
		  else {
		  	resolve(token.id);
      }
		});

	});
	
}

module.exports = {
	getToken : getToken
};
