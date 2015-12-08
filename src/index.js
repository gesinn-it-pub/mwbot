'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const Promise = require('bluebird');

class MWBot {


    //////////////////////////////////////////
    // CONSTRUCTOR                          //
    //////////////////////////////////////////

    constructor(options) {

        this.state = false;
        this.loggedIn = false;

        this.customSettings = options || {};

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

        if (this.customSettings.request) {
            this.defaultRequestOptions = this.merge(this.defaultRequestOptions, options.request)
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

    login(loginOptions) {

        this.state = {};

        this.loginPromise = new Promise((resolve, reject) => {

            // TODO: Better Validation
            if (!loginOptions.apiUrl) {
                return reject('No apiUrl provided!');
            } else if (!loginOptions.username ) {
                return reject('No username provided!');
            } else if (!loginOptions.password) {
                return reject('No password provided!');
            }

            this.defaultRequestOptions.url = loginOptions.apiUrl;

            let loginRequest = this.merge(this.defaultRequestOptions, {
                qs: {
                    action: 'login'
                },
                form: {
                    lgname: loginOptions.username,
                    lgpassword: loginOptions.password
                }
            });

            rp(loginRequest).then((response) => {

                if (!response.login || !response.login.result) {
                    let err = new Error('Invalid response from API');
                    err.response = response;
                    return reject(err) ;
                }

                this.state = this.merge(this.state, response.login);

                // Add token and re-submit login request
                loginRequest.form.lgtoken = response.login.token;

                return rp(loginRequest);

            }).then((response) => {


                if (!response.login || !response.login.result) {
                    return reject('Invalid response from API: ' + JSON.stringify(response));
                }

                this.state = this.merge(this.state, response.login);

                if (response.login && response.login.result === 'Success') {

                    // MW 1.8 - 1.19
                    let getEditToken = this.merge(this.defaultRequestOptions, {
                        qs: {
                            action: 'query',
                            meta: 'tokens',
                            type: 'csrf'
                        }
                    });

                    return rp(getEditToken);

                } else {
                    let reason = 'Unknown reason';
                    if (response.login && response.login.result) {
                        reason = response.login.result
                    }
                    let err = new Error('Could not login: ' + reason);
                    err.response = response;
                    return reject(err) ;
                }

            }).then((response) => {

                if (response.query && response.query.tokens && response.query.tokens.csrftoken) {

                    // SUCCESS
                    this.defaultRequestOptions.form.token = response.query.tokens.csrftoken;
                    this.state = this.merge(this.state, response.query.tokens);
                    this.loggedIn = true;

                    return resolve(this.state);

                } else {
                    return reject('Could not get edit token: ' + JSON.stringify(response)) ;
                }

            }).catch((err) => {
                reject(err);
            });

        });

        return this.loginPromise;

    };


    rawRequest(requestOptions) {
        return rp(requestOptions);
    };


    request(qs, requestOptions) {

        return new Promise((resolve, reject) => {

            if (!qs) {
                return reject('No parameters given!');
            }

            if (!this.loggedIn) {
                return reject('Must be logged in!');
            }

            requestOptions = requestOptions || {};

            let requestObj = this.merge(this.defaultRequestOptions, requestOptions);

            requestObj.qs = this.merge(requestObj.qs, qs);

            rp(requestObj).then((response) => {
                resolve(response);
            }).catch((err) => {
                reject(err);
            });


        });
    };


    //////////////////////////////////////////
    // CONVENIENCE FUNCTIONS                //
    //////////////////////////////////////////

    edit(title, content, summary, requestOptions) {

        return new Promise((resolve, reject) => {

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
    };

    delete(title, reason, requestOptions) {

        return new Promise((resolve, reject) => {

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

    merge(parent, child) {
        return _.merge(_.cloneDeep(parent), _.cloneDeep(child));
    };

    handleApiResponse(response, msg, reject) {

    };
}

module.exports = MWBot;
