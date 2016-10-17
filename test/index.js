'use strict';

/* jshint expr: true */

const chai = require('chai');
const mocha = require('mocha');
const fetchMock = require('fetch-mock');

const expect = chai.expect;

const spec = require('../lib/api.json');
const Musikki = require('../lib');

let musikki;

describe('api constructor', function() {

    it('should return an instance of the Musikki class', function() {

        musikki = new Musikki({ appid: 'fakeappid', appkey: 'fakeappkey' });

        expect(musikki).to.be.ok;
        expect(musikki).to.be.an.instanceof(Musikki);

    });

    it('should fail when not given an appid or appkey', function() {

        expect(() => new Musikki())
            .to.throw(Error, 'AssertionError: no appid given');

        expect(() => new Musikki({ appid: 'fakeappid' }))
            .to.throw(Error, 'AssertionError: no appkey given');


    });

});

describe('interface with methods loaded from specification json', function() {

    it('should contain endpoint functions', function() {

         Object.keys(spec.endpoints).forEach((endpoint_name) => {
            expect(musikki).to.have.property(endpoint_name);
            expect(musikki[endpoint_name]).to.be.a('function');
        });

    });

    it('endpoint functions should return object with method functions', function() {

        Object.keys(spec.endpoints).forEach((endpoint_name) => {

            let methods = musikki[endpoint_name]();
            Object.keys(spec.endpoints[endpoint_name]).forEach((method_name) => {

                expect(methods).to.have.property(method_name);
                expect(methods[method_name]).to.be.a('function');

            });

        });

    });

});

describe('musikki api usage', function() {

    before(() => {
        fetchMock.get('*', { result: 'ok' });
    });

    after(() => {
        fetchMock.restore();
    });

    it('using endpoints that require an mkid should reject with error when not given one', function() {

        /* results is an array of array of promises */
        let promiseArrayArray = Object.keys(spec.endpoints).map((endpoint_name) => {

            let methods = musikki[endpoint_name]();

            return Object.keys(spec.endpoints[endpoint_name]).map((method_name) => {

                let method = methods[method_name];
                let method_spec = spec.endpoints[endpoint_name][method_name];

                if (method_spec.indexOf('{mkid}') !== -1) {
                    return method()
                        .catch((error) => {
                            expect(error).to.be.instanceof(Error)
                                .and.have.property('message', 'this endpoint requires an mkid');
                        });
                }

            }).filter((value) => !!value);

        }).filter((value) => value.length > 0);

        return Promise.all(promiseArrayArray.map((promiseArray) => Promise.all(promiseArray)));

    });

    it('invoking api method functions should trigger http calls to the api', function() {

        /* results is an array of array of promises */
        let promiseArrayArray = Object.keys(spec.endpoints).map((endpoint_name) => {

            let methods = musikki[endpoint_name]('fakemkid');

            return Object.keys(spec.endpoints[endpoint_name]).map((method_name) => {

                let method = methods[method_name];
                let method_spec = spec.endpoints[endpoint_name][method_name];

                return method()
                    .then((response) => {
                        expect(response.result).to.equal('ok');
                    });

            }).filter((value) => !!value);

        }).filter((value) => value.length > 0);

        return Promise.all(promiseArrayArray.map((promiseArray) => Promise.all(promiseArray)));

    });

});
