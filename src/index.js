'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');

class MWBot {


    //////////////////////////////////////////
    // CONSTRUCTOR                          //
    //////////////////////////////////////////

    constructor(options) {

        this.state = {};
        this.loggedIn = false;

        this.options = options || {};

        this.defaultRequestOptions = {
            method: 'POST',
            jar: true,
            qs: {
                format: 'json'
            },
            form: {

            },
            json: true
        };

        if (this.options.request) {
            this.defaultRequestOptions = MWBot.merge(this.defaultRequestOptions, options.request);
        }

    }


    //////////////////////////////////////////
    // GETTER & SETTER                      //
    //////////////////////////////////////////

    get version() {
        let packageJson = require('../package.json');
        return packageJson.version;
    }


    //////////////////////////////////////////
    // CORE FUNCTIONS                       //
    //////////////////////////////////////////

    rawRequest(requestObj) {
        return rp(requestObj);
    }

    request(params, requestOptions) {

        return new Promise((resolve, reject) => {

            if (!params) {
                return reject('No parameters given!');
            }

            requestOptions = requestOptions || {};

            let requestObj = MWBot.merge(this.defaultRequestOptions, requestOptions);

            requestObj.form = MWBot.merge(requestObj.form, params);

            this.rawRequest(requestObj).then((response) => {
                resolve(response);
            }).catch((err) => {
                reject(err);
            });

        });
    }

    login(loginOptions) {

        this.loginPromise = new Promise((resolve, reject) => {

            // TODO: Better Validation
            if (!loginOptions.apiUrl) {
                return reject('No apiUrl provided!');
            } else if (!loginOptions.username ) {
                return reject('No username provided!');
            } else if (!loginOptions.password) {
                return reject('No password provided!');
            }

            // Set API URL
            this.defaultRequestOptions.url = loginOptions.apiUrl;

            let loginRequest = {
                action: 'login',
                lgname: loginOptions.username,
                lgpassword: loginOptions.password
            };

            this.request(loginRequest).then((response) => {

                if (!response.login || !response.login.result) {
                    let err = new Error('Invalid response from API');
                    err.response = response;
                    return reject(err) ;
                } else {
                    this.state = MWBot.merge(this.state, response.login);
                    // Add token and re-submit login request
                    loginRequest.lgtoken = response.login.token;
                    return this.request(loginRequest);
                }

            }).then((response) => {

                if (response.login && response.login.result === 'Success') {
                    this.state = MWBot.merge(this.state, response.login);
                    return resolve(this.state);
                } else {
                    let reason = 'Unknown reason';
                    if (response.login && response.login.result) {
                        reason = response.login.result;
                    }
                    let err = new Error('Could not login: ' + reason);
                    err.response = response;
                    return reject(err) ;
                }

            }).catch((err) => {
                reject(err);
            });

        });

        return this.loginPromise;

    }

    getEditToken() {

        return new Promise((resolve, reject) => {

            // MW >= 1.24
            this.request({
                action: 'query',
                meta: 'tokens',
                type: 'csrf'
            }).then((response) => {
                if (response.query && response.query.tokens && response.query.tokens.csrftoken) {

                    // SUCCESS
                    this.defaultRequestOptions.form.token = response.query.tokens.csrftoken;
                    this.state = MWBot.merge(this.state, response.query.tokens);
                    this.loggedIn = true;

                    return resolve(this.state);

                } else {
                    return reject('Could not get edit token: ' + JSON.stringify(response)) ;
                }
            }).catch((err) => {
                return reject(err);
            });
        });

    }


    //////////////////////////////////////////
    // CONVENIENCE FUNCTIONS                //
    //////////////////////////////////////////

    loginGetEditToken(loginOptions) {
        return this.login(loginOptions).then(() => {
            return this.getEditToken();
        });
    }

    edit(title, content, summary, requestOptions) {

        return new Promise((resolve, reject) => {

            if (!this.loggedIn) {
                return reject('Must be logged in!');
            }

            let qs = {
                action: 'edit',
                title: title,
                text: content,
                summary: summary
            };

            this.request(qs, requestOptions).then((response) => {

                if (response.error) {
                    let err = new Error('Could not edit page: ' + title + ' :: ' + response.error.code);
                    err.target = title;
                    err.response = response;
                    return reject(err);
                }

                if (response && response.edit && response.edit.result === 'Success') {
                    return resolve(response);
                } else {
                    let err = new Error('Could not edit page: ' + title);
                    err.target = title;
                    err.response = response;
                    return reject(err);
                }

            }).catch((err) => {
                return reject(err);
            });

        });
    }

    delete(title, reason, requestOptions) {

        return new Promise((resolve, reject) => {

            if (!this.loggedIn) {
                return reject('Must be logged in!');
            }

            let qs = {
                action: 'delete',
                title: title,
                reason: reason
            };

            this.request(qs, requestOptions).then((response) => {
                if (response.error) {
                    let err = new Error('Could not delete page: ' + title + ' :: ' + response.error.code);
                    err.target = title;
                    err.response = response;
                    return reject(err);
                } else {
                    return resolve(response);
                }
            }).catch((err) => {
                return reject(err);
            });

        });
    }


    //////////////////////////////////////////
    // HELPER FUNCTIONS                     //
    //////////////////////////////////////////

    static merge(parent, child) {
        return _.merge(_.cloneDeep(parent), _.cloneDeep(child));
    }

    static handleApiResponse() {
        // TODO

    }
}

module.exports = MWBot;
