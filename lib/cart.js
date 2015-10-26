
exports.getCartOrCreateForCustomer = function(tenant, customerToken, customerId) {
    
    return new Promise(function(resolve, reject) {

        request({
            url : 'https://api.yaas.io/hybris/cart/b1/' + tenant + '/carts?customerId=' + customerId,
            method : 'GET',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json:true
        }, function(error, response, body) {
            if (error)
                reject(error);
            else if (body.id)
            {
                console.log("Existing cart: " + body.id);
                resolve(body.id);
            }
            else {
                //create new cart and return cart id
                console.log("Need to create new cart...");
                
                // FIXME
                exports.createCartForCustomer(tenant, customerToken).then(function(cartId){
                    resolve(cartId);
                }, function(error){
                    reject(error);
                });

            }
        }); 


    });

};

exports.createCartForCustomer = function(tenant, customerToken) {
    
    return new Promise(function(resolve, reject){

        console.log("Creating cart for customer...");
        request({
            url : 'https://api.yaas.io/hybris/cart/b1/' + tenant + '/carts',
            method : 'POST',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json:true,
            body: {
                    currency: 'USD'
            }
        }, function(error, response, body) {
            if (error)
                reject(error);
            else if (body.cartId)
                resolve(body.cartId);
            else
                reject(new Error(JSON.stringify(body)));
            
        });

    });
};

exports.addProductToCart = function(tenant, customerToken, cartId, product, price, quantity) {
    
    return new Promise(function(resolve, reject) {

        request({
            url : 'https://api.yaas.io/hybris/cart/b1/' + tenant + '/carts/' + cartId + '/items',
            method : 'POST',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json:true,
            body: {
                product : product,
                quantity :  quantity || 1,
                price : price
            }
        }, function(error, response, body) {
            if (body.itemId)
                resolve();
            else
                reject(Error(JSON.stringify(body)));
        });


    });
};