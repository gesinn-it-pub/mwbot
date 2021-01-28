'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;

const chai = require('chai');
const expect = chai.expect;

let loginCredentials = require('./mocking/loginCredentials.json');

// use local login credentials if available
try {
    let loginCredentialsLocal = require('./mocking/loginCredentials.local.json');
    if (loginCredentialsLocal) loginCredentials = loginCredentialsLocal;
} catch (e) {
    //ignore
}

describe('MWBot Batch Request', function () {
    this.timeout(50000);

    it('successfully creates, updates, deletes and edits', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        const response = await bot.batch({
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

        expect(response).to.be.instanceof(Object);
        expect(response.create).to.be.instanceof(Object);
        expect(response.create.TestPage1).to.be.instanceof(Object);
        expect(response.create.TestPage1.response).to.be.instanceof(Object);
        expect(response.delete).to.be.instanceof(Object);
        expect(response.edit).to.be.instanceof(Object);

    });

    it('successfully reads', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        const response = await bot.batch({
            read: [
                'Main Page',
                'TestPage1',
                'TestPage2',
                'TestPage3',
                'TestPage4'
            ]
        });

        // log(response);
        expect(response).to.be.instanceof(Object);
        expect(response.read).to.be.instanceof(Object);
        expect(response.read['Main Page']).to.be.instanceof(Object);
        expect(response.read['Main Page'].query).to.be.instanceof(Object);
        expect(response.read['Main Page'].query.pages).to.be.instanceof(Object);
        expect(response.read['Main Page'].query.pages['1']).to.be.instanceof(Object);
        expect(response.read['Main Page'].query.pages['1'].title).to.equal('Main Page');
    });

    it('successfully uploads and uploadOverwrites', async function () {

        let bot = new MWBot({
            verbose: true
        });

        await bot.loginGetEditToken(loginCredentials.valid);
        await bot.delete('File:example1.png');
        await bot.delete('File:example2.png');
        await bot.delete('File:example3.png');

        const response = await bot.batch({
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

        expect(response).to.be.instanceof(Object);
        expect(response.upload).to.be.instanceof(Object);
        expect(response.upload['example1.png']).to.be.instanceof(Object);
        expect(response.upload['example1.png'].upload).to.be.instanceof(Object);

        expect(response.upload['NonExistingImage.png']).to.be.instanceof(Object);
        expect(response.upload['NonExistingImage.png'].code).to.equal('ENOENT');

        expect(response.uploadOverwrite).to.be.instanceof(Object);
    });

    it('successfully creates, updates, deletes and edits in raw format and concurrency 1', async function () {

        let bot = new MWBot({
            verbose: true
        });

        await bot.loginGetEditToken(loginCredentials.valid);

        try {
            const response = await bot.batch([
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

            expect(response).to.be.instanceof(Object);
            expect(response.create).to.be.instanceof(Object);
            expect(response.create.TestPage1).to.be.instanceof(Object);
            expect(response.create.TestPage1.response).to.be.instanceof(Object);

        } catch (err) {
            log(err);
        }
    });
});
