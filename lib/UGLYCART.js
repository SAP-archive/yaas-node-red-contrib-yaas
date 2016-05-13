function getCartByCustomerId(yaas, customerId, siteCode, currency) {
  // Get/create shopping cart
  return new Promise(function(resolve, reject) {
    var cart;

    yaas.cart.getByCriteria({
        customerId : customerId,
        siteCode : siteCode,
        currency : currency
    })
    .then(response => {
        cart = response.body;
        cart.cartId = cart.id; // Fixing API inconsistency
        resolve(cart);
    })
    .catch(response => {
        if(response.statusCode === 404) {
            yaas.cart.create(customerId, currency, siteCode)
            .then(response => resolve(response.body))
            .catch(reject);
        } else {
            reject(response);
        }
    });
  });
}

function getCartByCustomerEmail(yaas, customerEmail, siteCode, currency) {
    return yaas.customer.getCustomers({q: 'contactEmail:"' + customerEmail + '"'})
    .then(response => getCartByCustomerId(yaas, response.body[0].customerNumber, siteCode, currency));
}


exports.getCartByCustomerId = getCartByCustomerId;
exports.getCartByCustomerEmail = getCartByCustomerEmail;
