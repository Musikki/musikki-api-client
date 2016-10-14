'use strict';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const _ = require('lodash');
const assert = require('assert');

const api = require('./api.json');

const debug = !!process.env.DEBUG;


/*
 * Class 'Musikki'
 * Package interface
 */
let Musikki = function(config) {

    this.config = _.merge({
        appid: null,
        appkey: null
    }, config);

    assert(this.config.appid, 'No AppID set');
    assert(this.config.appkey, 'No AppKey set');

    /*
     * dynamically define the api methods */
    _.forOwn(api.endpoints, (methods, endpoint) => {

        Musikki.prototype[endpoint] = (mkid) => {

            _.forOwn(methods, (path, method) => {

                Musikki.prototype[endpoint][method] = (query, paging) => {
                    let url = this.buildQuery(path, mkid, query, paging);
                    return this.performQuery(url);
                };

            });

            return Musikki.prototype[endpoint];

        };

    });

};

Musikki.prototype.buildQuery = function(path, mkid, query, paging) {

    let url = api.baseurl;

    if (path.indexOf('{mkid}') !== -1) {

        if (!mkid) {
            throw new Error('this endpoint requires an mkid');
        }

        path = path.replace('{mkid}', mkid);
    }

    if (path.indexOf('{q}') !== -1) {
        path = path.replace('{q}', '?q=' + _.reduce(query, function(result, value, key) {
            return result + `[${key}:${value}]`;
        }, ''));
    }

    url += path;

    if (paging && paging.limit) {
        url += `&limit=${paging.limit}`;
    }

    if (paging && paging.page) {
        url += `&page=${paging.page}`;
    }

    return url;

};

Musikki.prototype.performQuery = function(url) {

    if (debug) {
        console.info(`Querying ${url}...`);
    }

    return fetch(url, {
            method: 'GET',
            headers: {
                appid: this.config.appid,
                appkey: this.config.appkey
            }
        })
        .then((response) => {

            if (!response.ok) {

                return response.json()
                    .then((payload) => {

                        let result = {
                            status: response.status,
                            message: response.statusText,
                            payload: payload
                        };

                        return result;

                    })
                    .catch((error) => {

                        let result = {
                            status: response.status,
                            message: response.statusText
                        };

                        return result;

                    })
                    .then((result) => Promise.reject(result));

            }

            return response.json();

        });


};

module.exports = Musikki;