// note: this test requires following environment variables:
//       - TEST_YAAS_CLIENT_ID
//       - TEST_YAAS_CLIENT_SECRET
//       - TEST_YAAS_DATA_PRODUCTDETAILS (optional)

var testDataViaEnv;
if (process.env.TEST_YAAS_DATA_PRODUCTDETAILS) {
    eval("testDataViaEnv = " + process.env.TEST_YAAS_DATA_PRODUCTDETAILS + ";");
}

const TEST_DATA = testDataViaEnv || {
    "productId": "57a3263150c466001d4fdc46",
    "sku": "8700810087",
    "currency": "USD"
};

var oauth2 = require('../lib/oauth2.js');
var productdetails = require('../lib/productdetails.js');

describe('Product Details', function () {

    describe('get details by ID', function () {
        it('should find a product', function (done) {
            oauth2.getClientCredentialsToken(
                process.env.TEST_YAAS_CLIENT_ID, process.env.TEST_YAAS_CLIENT_SECRET, ['hybris.pcm_read'])
                .then(function (authData) {
                    authData.should.have.property('token_type', 'Bearer');
                    return productdetails.getDetailsByID(
                        authData.tenant, authData.access_token, TEST_DATA.productId, TEST_DATA.currency);
                })
                .then(function (result) {
                    var product = result.product;
                    product.should.have.property('id', TEST_DATA.productId);
                    product.should.have.property('sku', TEST_DATA.sku);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('get details by query', function () {
        it('should find a product by sku', function (done) {
            oauth2.getClientCredentialsToken(
                process.env.TEST_YAAS_CLIENT_ID, process.env.TEST_YAAS_CLIENT_SECRET, ['hybris.pcm_read'])
                .then(function (authData) {
                    authData.should.have.property('token_type', 'Bearer');
                    return productdetails.getDetailsByQuery(
                        authData.tenant, authData.access_token, 'sku:"' + TEST_DATA.sku + '"', TEST_DATA.currency);
                })
                .then(function (result) {
                    result.should.be.an.Array;
                    result.should.not.be.empty();
                    // result is an array
                    var product = result[0].product;
                    product.should.have.property('id', TEST_DATA.productId);
                    product.should.have.property('sku', TEST_DATA.sku);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });
});
