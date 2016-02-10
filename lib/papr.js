var request = require('request');

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
            
            //console.log("ERR", error);
            //console.log("R", response);
            //console.log("BODY", body);
            
            if (body.stockLevel){
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
            ////// console.log("B", body, response.statusCode);
            if (response.statusCode == 200){
                resolve(body);
            }
            else
                reject(JSON.stringify(body));
        });
    });
};