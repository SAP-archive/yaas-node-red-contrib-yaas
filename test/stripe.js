var stripeLib = require("stripe");


var stripe_secret = 'sk_test_IKEnGcAh5Jyr0WjsZag7m7Pq';
//var stripe_public = 'pk_test_XcZRjJD6o3Uxr0VdtqHO2h8u';

var stripe = stripeLib(stripe_secret);

stripe.tokens.create({
  card: {
    "number": '4242424242424242',
    "exp_month": 12,
    "exp_year": 2016,
    "cvc": '123'
  }
}, function(err, token) {
  // asynchronously called
  console.log(token);
});

