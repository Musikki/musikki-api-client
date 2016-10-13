'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const Wreck = require('wreck');
const assert = require('assert');

let debug = !!process.env.DEBUG;

let internals = {};

internals.baseurl = 'https://music-api.musikki.com/v1';

internals.endpoints = {

    'artists': {
        'search': '/artists/{q}',
        'info': '/artists/{mkid}{q}',
        'bio': '/artists/{mkid}/bio',
        'collaborations': '/artists/{mkid}/collaborations{q}',
        'labels': '/artists/{mkid}/labels{q}',
        'listen': '/artists/{mkid}/listen',
        'news': '/artists/{mkid}/news{q}',
        'related': '/artists/{mkid}/related{q}',
        'releases': '/artists/{mkid}/releases{q}',
        'releaseSummary': '/artists/{mkid}/releases/summary',
        'social': '/artists/{mkid}/social{q}',
        'songs': '/artists/{mkid}/songs{q}',
        'videos': '/artists/{mkid}/videos{q}',
    }

};


internals.url = function(syntax, mkid, query, paging) {

    let url = internals.baseurl;

    if (syntax.indexOf('{mkid}') !== -1) {

        if (!mkid) {
            throw new Error('this endpoint requires an mkid');
        }

        syntax = syntax.replace('{mkid}', mkid);
    }

    if (syntax.indexOf('{q}') !== -1) {
        syntax = syntax.replace('{q}', '?q=' + _.reduce(query, function(result, value, key) {
            return result + `[${key}:${value}]`;
        }, ''));
    }

    url += syntax;

    if (paging && paging.limit) {
        url += `&limit=${paging.limit}`;
    }

    if (paging && paging.page) {
        url += `&page=${paging.page}`;
    }

    return url;

};

internals.call = function(config, syntax, mkid, query, paging) {

    let url = internals.url(syntax, mkid, query, paging);

    if (debug) {
        console.info(`Querying ${url}...`);
    }

    return new Promise((resolve, reject) => {

        return Wreck.get(url, {
            json: true,
            headers: {
                appid: config.appid,
                appkey: config.appkey
            }
        }, (error, response, payload) => {

            if (error) {
                return reject(error);
            }

            if (response.statusCode !== 200) {
                return reject(new Error(`${response.statusCode} ${response.statusMessage}`));
            }

            return resolve(payload);

        });
    });

};

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
     * Dynamically define the package interface's methods
     */
    _.forOwn(internals.endpoints, function(methods, endpoint) {

        Musikki.prototype[endpoint] = function(mkid) {

            _.forOwn(methods, (syntax, method) => {

                this[method] = function(query, paging) {
                    return internals.call(this.config, syntax, mkid, query, paging);
                };

            });

            return this;

        };

    });

};



module.exports = Musikki;