'use strict';

// note: this test requires following environment variables:
//       - TEST_STRIPE_PK_KEY

var stripeLib = require('stripe');

var stripe = stripeLib(process.env.TEST_STRIPE_PK_KEY);

const TEST_DATA = {
  card: {
    'number': '4242424242424242',
    'exp_month': 12,
    'exp_year': 2022,
    'cvc': '123'
  }
};

describe('Stripe', function () {
  describe('token create', function () {
    it('should have an id with tok_', function (done) {

      stripe.tokens.create(TEST_DATA, function (err, token) {
        token.should.have.property('id').and.containEql('tok_');
        //console.log('\tSTRIPE TOKEN:', token.id);
        done();
      })
      .catch(function (err) {
        done(err);
      });
    });
  });
});
