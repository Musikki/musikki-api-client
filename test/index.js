/* jshint expr: true */

const chai = require('chai');
const mocha = require('mocha');
const sinon = require('sinon');

const expect = chai.expect;

const spec = require('../lib/api.json');
const Musikki = require('../lib');

let musikki;

describe('constructor', function() {

    it('should return an instance of the Musikki class', function() {

        musikki = new Musikki({ appid: 'fakeappid', appkey: 'fakeappkey' });

        expect(musikki).to.be.ok;
        expect(musikki).to.be.an.instanceof(Musikki);

    });

    it('should fail when not given an appid or appkey', function() {

        expect(function() {
            return new Musikki();
        }).to.throw(Error, 'AssertionError: no appid given');

        expect(function() {
            return new Musikki({ appid: 'fakeappid' });
        }).to.throw(Error, 'AssertionError: no appkey given');


    });

});

describe('method loading from specification json', function() {

    it('instance should contain endpoint functions', function() {

         Object.keys(spec.endpoints).forEach((endpoint_name) => {
            expect(musikki).to.have.property(endpoint_name);
            expect(musikki[endpoint_name]).to.be.a('function');
        });

    });

    it('endpoint functions should return object with method functions', function() {

        Object.keys(spec.endpoints).forEach((endpoint_name) => {

            let methods = musikki[endpoint_name]();
            console.log(methods);
            Object.keys(spec.endpoints[endpoint_name]).forEach((method_name) => {

                expect(methods).to.have.property(method_name);
                expect(methods[method_name]).to.be.a('function');

            });

        });

    });

});
