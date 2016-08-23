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
                    'TestPage2': 'TestContent2',
                    'TestPage3': Math.random()
                }
            }, 'Batch Upload Reason');

        }).then((response) => {
            expect(response).to.be.instanceof(Object);
            expect(response.create).to.be.instanceof(Object);
            expect(response.create.TestPage1).to.be.instanceof(Object);
            expect(response.create.TestPage1.response).to.be.instanceof(Object);
            expect(response.create.TestPage1.response).to.be.instanceof(Object);
            expect(response.delete).to.be.instanceof(Object);
            expect(response.edit).to.be.instanceof(Object);
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
            // log(response);
            expect(response).to.be.instanceof(Object);
            expect(response.read).to.be.instanceof(Object);
            expect(response.read['Main Page']).to.be.instanceof(Object);
            expect(response.read['Main Page'].query).to.be.instanceof(Object);
            expect(response.read['Main Page'].query.pages).to.be.instanceof(Object);
            expect(response.read['Main Page'].query.pages['1']).to.be.instanceof(Object);
            expect(response.read['Main Page'].query.pages['1'].title).to.equal('Main Page');
            done();
        });
    });


    it('upload and uploadOverwrite', function(done) {

        let bot = new MWBot({
            verbose: true
        });

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.batch({
                upload: [
                    __dirname + '/mocking/example1.png',
                    __dirname + '/mocking/example2.png',
                    __dirname + '/mocking/example3.png',
                    __dirname + '/mocking/NonExistingImage.png'
                ],
                uploadOverwrite: {
                    'ExampleImage1.png': __dirname + '/mocking/example1.png',
                    'ExampleImage2.png': __dirname + '/mocking/example2.png',
                    'ExampleImage3.png': __dirname + '/mocking/example3.png'
                }
            });

        }).then((response) => {
            expect(response).to.be.instanceof(Object);
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
            expect(response).to.be.instanceof(Object);
            done();
        });

    });
});
