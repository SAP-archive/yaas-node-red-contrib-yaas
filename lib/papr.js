var request = require('request');

exports.getStock = function(customerToken, quantity) {
    
    return new Promise(function(resolve, reject) {

        request({
            url : 'https://api.yaas.io/papr/paprservice/v1/stock',
            method : 'GET',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json:true
        }, function(error, response, body) {
            if (response.statusCode == 200){
                resolve(body);
            }
            else
                reject(JSON.stringify(body));
        });
    });
};

exports.add = function(customerToken, quantity) {
    
    return new Promise(function(resolve, reject) {

        request({
            url : 'https://api.yaas.io/papr/paprservice/v1/stock/add',
            method : 'POST',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json:true,
            body: {
                quantity :  quantity || 1
            }
        }, function(error, response, body) {
            if (response.statusCode == 200){
                resolve(body);
            }
            else
                reject(JSON.stringify(body));
        });
    });
};

exports.decrease = function(customerToken, quantity) {
    
    return new Promise(function(resolve, reject) {

        request({
            url : 'https://api.yaas.io/papr/paprservice/v1/stock/decrease', 
            method : 'POST',
            headers : {'Authorization' : 'Bearer ' + customerToken},
            json:true,
            body: {}
        }, function(error, response, body) {
            if (response.statusCode == 200){
                resolve(body);
            }
            else
                reject(JSON.stringify(body));
        });
    });
};