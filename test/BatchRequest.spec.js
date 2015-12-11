'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;

const chai = require('chai');
const expect = chai.expect;

const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Batch Request', function() {


    it('with create, update, delete and edit', function(done) {

        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.batch({
                create: {
                    'TestPage1': 'TestContent1',
                    'TestPage2': 'TestContent2'
                },
                update: {
                    'TestPage1': 'TestContent1-Update'
                },
                delete: [
                    'TestPage2'
                ],
                edit: {
                    'TestPage2': 'TestContent2'
                }
            }, 'Batch Upload Reason');

        }).then((response) => {
            expect(response).to.be.instanceof(Array);
            done();
        });

    });


    it('with read', function(done) {

        let bot = new MWBot();

        bot.login(loginCredentials.valid).then(() => {
            return bot.batch({
                read: [
                    'Main Page',
                    'TestPage1',
                    'TestPage2',
                    'TestPage3',
                    'TestPage4'
                ]
            });

        }).then((response) => {
            expect(response).to.be.instanceof(Array);
            done();
        });
    });


    it('in raw format and concurrency 1', function(done) {

        let bot = new MWBot({
            verbose: true
        });

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.batch([
                [
                    'create',
                    'TestPage1',
                    'TestContent1',
                    'Batch Upload Reason'
                ],
                [
                    'create',
                    'TestPage2',
                    'TestContent2',
                    'Batch Upload Reason'
                ],
                [
                    'update',
                    'TestPage1',
                    'TestContent1-Update',
                    'Batch Upload Reason'
                ],
                [
                    'delete',
                    'TestPage2',
                    'Batch Upload Reason'
                ],
                [
                    'edit',
                    'TestPage2',
                    'TestContent2',
                    'Batch Upload Reason'
                ]
            ], false, 1);

        }).then((response) => {
            expect(response).to.be.instanceof(Array);
            done();
        });

    });
});
