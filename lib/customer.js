var request = require('request');

exports.login = function(tenant, token, email, password) {

    return new Promise(function(resolve, reject) {

        request({
            url : 'https://api.yaas.io/hybris/customer/b1/' + tenant + '/login',
            method : 'POST',
            headers : {'Authorization' : 'Bearer ' + token},
            json:true,
            body: {
                    "email": email,
                    "password": password
            }
        }, function(error, response, body) {
            // FIXME
            if (body.accessToken) // FIXME
                resolve(body.accessToken); // FIXME
            else // FIXME
                reject(response); // FIXME
        });

    });
};

exports.me = function(tenant, access_token) {
    
    return new Promise(function(resolve, reject){
        request({
            url : 'https://api.yaas.io/hybris/customer/b1/' + tenant + '/me',
            method : 'GET',
            headers : {'Authorization' : 'Bearer ' + access_token},
            json:true,
            qs: {
              expand : "defaultAddress"
            }
        }, function(error, response, body) {
            if (body.customerNumber)
                resolve(body);
            else
                reject(Error(JSON.stringify(body)));
        });
    });
};
