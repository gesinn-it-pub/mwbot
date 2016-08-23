'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;

const chai = require('chai');
const expect = chai.expect;

const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Request', function() {

    'use strict';


    //////////////////////////////////////////
    // SUCESSFULL                           //
    //////////////////////////////////////////

    it('combines reading, changing and uploading a wiki page', function(done) {
        let bot = new MWBot();
        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.read('Main Page');
        }).then((response) => {
            let pageContent = response.query.pages['1']['revisions'][0]['*'];
            pageContent += ' Appendix';
            return bot.update('Main Page', pageContent);
        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
            done();
        }).catch((err) => {
            log(err);
        });
    });

    it('concurrent jobs with bluebird.js Promise.map', function(done) {
        let bot = new MWBot();

        let pages = [
            'Main Page',
            'Test Page'
        ];

        let pagesTotal = pages.length || 0;
        let pageCounter = 0;

        bot.loginGetEditToken(loginCredentials.valid).then(() => {

            return MWBot.map(pages, (page) => {

                pageCounter += 1;

                return bot.request({
                    action: 'purge',
                    titles: page,
                    forcelinkupdate: true
                }).then((response) => {

                    // Use MWBot.logStatus helper function
                    if (response.error) {
                        MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                    } else {
                        MWBot.logStatus('[=] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                    }
                }).catch((err) => {
                    MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', page);
                    log(err);
                });

            }, {
                concurrency: 2
            });

        }).then(() => {
            done();
        }).catch((err) => {
            log(err);
        });
    });

    it('sequential jobs with bluebird.js Promise.mapSeries', function(done) {
        let bot = new MWBot();

        let pages = [
            'Main Page',
            'Test Page'
        ];

        let pagesTotal = pages.length || 0;
        let pageCounter = 0;

        bot.loginGetEditToken(loginCredentials.valid).then(() => {

            return MWBot.mapSeries(pages, (page) => {

                pageCounter += 1;

                return bot.request({
                    action: 'purge',
                    titles: page,
                    forcelinkupdate: true
                }).then((response) => {

                    // Use MWBot.logStatus helper function
                    if (response.error) {
                        MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                    } else {
                        MWBot.logStatus('[=] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                    }
                }).catch((err) => {
                    MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', page);
                    log(err);
                });

            });

        }).then(() => {
            done();
        }).catch((err) => {
            log(err);
        });
    });



    //////////////////////////////////////////
    // UNSUCESSFULL                         //
    //////////////////////////////////////////

});
