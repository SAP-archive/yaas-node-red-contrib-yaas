'use strict';

module.exports = function(RED) {
    function StripeCredentialsNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        node.stripe_secret = n.stripe_secret;
        node.credit_card_expiry_month = n.credit_card_expiry_month;
        node.credit_card_expiry_year = n.credit_card_expiry_year;
        node.credit_card_cvc = n.credit_card_cvc;

        if (node.credentials) {
            node.credit_card_number = node.credentials.credit_card_number;
        }
    }

    RED.nodes.registerType('stripe-credentials',StripeCredentialsNode,{
        credentials: {
            credit_card_number: {type: 'password'}
        }
    }); 
};

