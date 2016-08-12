var helper = require('../lib/helper');
var should = require('should');

describe('Helper', function () {

    describe('tenant Id from applicationId', function () {
        it('tenantId should be a function', function() {
            helper.tenantId.should.be.a.Function;
        });

        it('undefined parameter should be undefined', function () {
            should(helper.tenantId(undefined)).be.undefined;
        });

        it('undefined application Id should be undefined', function () {
            var yaasCredentials = {};
            //yaasCredentials.application_id = {};
            should(helper.tenantId(yaasCredentials)).be.undefined;
        });

        it('empty application Id should be undefined', function () {
            var yaasCredentials = {};
            yaasCredentials.application_id = {};
            should(helper.tenantId(yaasCredentials)).be.undefined;
        });

        it('application Id without identifier should be tenant id', function () {
            var tenantId = "tenantid";
            var yaasCredentials = {};
            yaasCredentials.application_id = tenantId;
            helper.tenantId(yaasCredentials).should.be.exactly(tenantId);
        });

        it('application Id with identifier should be tenant id', function () {
            var tenantId = "tenantid";
            var yaasCredentials = {};
            yaasCredentials.application_id = tenantId + ".identifier";
            helper.tenantId(yaasCredentials).should.be.exactly(tenantId);
        });

    });
});

