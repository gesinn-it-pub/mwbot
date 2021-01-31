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
        try {
            await bot.delete('BatchRequestTestPage1');
            await bot.delete('BatchRequestTestPage2');
            await bot.delete('BatchRequestTestPage3');
            await bot.delete('BatchRequestTestPage4');
        } catch (e) {
            // ignore
        }

        const response = await bot.batch({
            create: {
                'BatchRequestTestPage1': 'TestContent1',
                'BatchRequestTestPage2': 'TestContent2'
            },
            update: {
                'BatchRequestTestPage1': 'TestContent1-Update'
            },
            delete: [
                'BatchRequestTestPage2'
            ],
            edit: {
                'BatchRequestTestPage2': 'TestContent2',
                'BatchRequestTestPage3': Math.random()
            }
        }, 'Batch Upload Reason');

        //log(response);
        expect(response).to.be.instanceof(Object);
        expect(response.create).to.be.instanceof(Object);
        expect(response.create.BatchRequestTestPage1).to.be.instanceof(Object);
        expect(response.create.BatchRequestTestPage1.edit.result).to.equal('Success');
        expect(response.update.BatchRequestTestPage1.edit.result).to.equal('Success');
        expect(response.delete).to.be.instanceof(Object);
        expect(response.delete.BatchRequestTestPage2.delete.title).to.equal('BatchRequestTestPage2');
        expect(response.edit).to.be.instanceof(Object);
        expect(response.create.BatchRequestTestPage2.edit.result).to.equal('Success');

    });

    it('successfully reads', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        const response = await bot.batch({
            read: [
                'Main Page',
                'BatchRequestTestPage1',
                'BatchRequestTestPage2',
                'BatchRequestTestPage3',
                'BatchRequestTestPage4'
            ]
        });

        //log(response);
        expect(response).to.be.instanceof(Object);
        expect(response.read).to.be.instanceof(Object);
        expect(response.read['Main Page']).to.be.instanceof(Object);
        expect(response.read['Main Page'].query).to.be.instanceof(Object);
        expect(response.read['Main Page'].query.pages).to.be.instanceof(Object);
        expect(response.read['Main Page'].query.pages['1']).to.be.instanceof(Object);
        expect(response.read['Main Page'].query.pages['1'].title).to.equal('Main Page');
    });

    it('successfully uploads and uploadOverwrites', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        try {
            await bot.delete('File:example1.png');
            await bot.delete('File:example2.png');
            await bot.delete('File:example3.png');
        } catch(e) {
            //ignore
        }

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
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        try {
            await bot.delete('BatchRequestTestPage1');
            await bot.delete('BatchRequestTestPage2');
            await bot.delete('BatchRequestTestPage3');
            await bot.delete('BatchRequestTestPage4');
        } catch (e) {
            // ignore
        }

        try {
            const response = await bot.batch([
                [
                    'create',
                    'BatchRequestTestPage1',
                    'TestContent1',
                    'Batch Upload Reason'
                ],
                [
                    'create',
                    'BatchRequestTestPage2',
                    'TestContent2',
                    'Batch Upload Reason'
                ],
                [
                    'update',
                    'BatchRequestTestPage1',
                    'TestContent1-Update',
                    'Batch Upload Reason'
                ],
                [
                    'delete',
                    'BatchRequestTestPage2',
                    'Batch Upload Reason'
                ],
                [
                    'edit',
                    'BatchRequestTestPage2',
                    'TestContent2',
                    'Batch Upload Reason'
                ]
            ], false, 1);

            expect(response).to.be.instanceof(Object);
            expect(response.create).to.be.instanceof(Object);
            expect(response.create.BatchRequestTestPage1).to.be.instanceof(Object);
            expect(response.create.BatchRequestTestPage1.edit.result).to.equal('Success');
            expect(response.update.BatchRequestTestPage1.edit.result).to.equal('Success');
            expect(response.delete).to.be.instanceof(Object);
            expect(response.delete.BatchRequestTestPage2.delete.title).to.equal('BatchRequestTestPage2');
            expect(response.edit).to.be.instanceof(Object);
            expect(response.create.BatchRequestTestPage2.edit.result).to.equal('Success');
        } catch (err) {
            log(err);
        }
    });
});
