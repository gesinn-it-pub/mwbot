'use strict';

/*global describe, it*/

const MWBot = require('../src/');
//const log = require('semlog').log;

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

let loginCredentials = require('./mocking/loginCredentials.json');

// use local login credentials if available
try {
    let loginCredentialsLocal = require('./mocking/loginCredentials.local.json');
    if (loginCredentialsLocal) loginCredentials = loginCredentialsLocal;
} catch (e) {
    //ingore
}

describe('MWBot Upload', function () {
    'use strict';
    this.timeout(20000);

    it('successfully uploads and overwrites an image with uploadOverwrite()', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        // make sure, the test file does not exist
        try {
            await bot.delete('File:ExampleImage.png', 'Upload Test');
        } catch (err) {
            //ignore
        }

        // upload
        try {
            const r3 = await bot.uploadOverwrite(
                'ExampleImage.png',
                __dirname + '/mocking/example2.png',
                'Test Reasons');
            expect(r3.upload.result).to.equal('Success');
            expect(JSON.stringify(r3.warnings)).to.not.exist;
        } catch (err) {
            assert.fail(err, 'Success', err);
        }

        // upload again expecting 'fileexists-no-change'
        try {
            const r4 = await bot.upload(
                'ExampleImage.png',
                __dirname + '/mocking/example2.png',
                'Test Reasons');
            expect(r4.upload.result).to.equal('Success');
            expect(JSON.stringify(r4.warnings)).to.not.exist;
        } catch (err) {
            expect(err.code).to.equal('fileexists-no-change');
        }
    });

    it('successfully uploads without providing a filename with upload()', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        // make sure, the test file does not exist
        try {
            await bot.delete('File:ExampleImage.png', 'Upload Test');
            await bot.delete('File:Example2.png', 'Upload Test');
        } catch (err) {
            //ignore
        }

        // upload
        try {
            const r4 = await bot.upload(
                false,
                __dirname + '/mocking/example2.png',
                'Test Reasons');
            expect(r4.upload.result).to.equal('Success');
            expect(JSON.stringify(r4.warnings)).to.not.exist;
        } catch (err) {
            assert.fail(err, 'Success', err);
        }
    });

    it('rejects to upload a non-existing file with upload()', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        // upload
        try {
            await bot.upload(
                false,
                __dirname + '/mocking/non-existing-file.png',
                'Test Reasons');
        } catch (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('ENOENT');
        }
    });
});
