var request = require('request');

exports.getCartOrCreateForCustomer = function(tenant, customerToken, customerId, siteCode, currency) {
    console.log({
        customerId : customerId,
        siteCode : siteCode,
        currency : currency
    });

    return new Promise(function(resolve, reject) {
        request({
            url : 'https://api.yaas.io/hybris/cart/b1/' + tenant + '/carts',
            method : 'GET',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json : true,
            qs : {
                customerId : customerId,
                siteCode : siteCode,
                currency : currency
            }
        }, function(error, response, body) {
            if (error){
                reject(error);
            }
            else if (body.id)
            {
                console.log("Existing cart: " + body.id);
                resolve(body.id);
            }
            else {
                //create new cart and return cart id
                console.log("Need to create new cart...");
                
                // FIXME
                exports.createCartForCustomer(tenant, customerToken, siteCode, currency)
                .then(function(cartId){
                    resolve(cartId);
                }, function(error){
                    reject(error);
                });

            }
        }); 


    });

};

exports.createCartForCustomer = function(tenant, customerToken, siteCode, currency) {
    
    return new Promise(function(resolve, reject){

        console.log("Creating cart for customer...");
        console.log("currency: " + currency);
        console.log("site: " + siteCode);
        request({
            url     : 'https://api.yaas.io/hybris/cart/b1/' + tenant + '/carts',
            method  : 'POST',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json    : true,
            body    : {
                currency : currency,
                siteCode : siteCode
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
            if (body.itemId){
                resolve({cartId : cartId, itemId : body.itemId});
            }
            else
                reject(JSON.stringify(body));
        });


    });
};
