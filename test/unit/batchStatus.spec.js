import * as chai from 'chai';
const { expect } = chai;

import { statusForResponse, statusForError } from '../../src/batchStatus.js';

describe('batchStatus statusForResponse()', function () {
    it('reports a deleted page', function () {
        expect(statusForResponse('delete', { delete: {} }).status).to.equal('[-] ');
    });

    it('reports a newly created page', function () {
        expect(statusForResponse('create', { edit: { new: '', newrevid: 1 } }).status).to.equal('[+] ');
    });

    it('reports a changed page', function () {
        expect(statusForResponse('edit', { edit: { newrevid: 2 } }).status).to.equal('[C] ');
    });

    it('reports an unchanged edit as no-change', function () {
        expect(statusForResponse('edit', { edit: { result: 'Success' } })).to.deep.equal({
            status: '[=] ',
            reason: '',
            debugMessages: [],
        });
    });

    it('reports a missing page when reading', function () {
        const result = statusForResponse('read', { query: { pages: { '-1': { missing: '' } } } });
        expect(result.status).to.equal('[?] ');
        expect(result.reason).to.equal('missing');
    });

    it('reports a successful read', function () {
        expect(statusForResponse('read', { query: { pages: { 1: {} } } }).status).to.equal('[S] ');
    });

    it('reports a successful upload', function () {
        expect(statusForResponse('upload', { upload: { result: 'Success' } }).status).to.equal('[S] ');
    });

    it('reports an upload warning about a duplicate', function () {
        const result = statusForResponse('upload', {
            upload: { result: 'Warning', warnings: { duplicate: ['A.png', 'B.png'] } },
        });
        expect(result.status).to.equal('[/] ');
        expect(result.reason).to.equal('duplicate');
        expect(result.debugMessages).to.deep.equal(['[D] [MWBOT] Duplicate: A.png, B.png']);
    });

    it('reports an upload warning about an existing file', function () {
        const result = statusForResponse('upload', {
            upload: { result: 'Warning', warnings: { exists: 'A.png' } },
        });
        expect(result.status).to.equal('[/] ');
        expect(result.reason).to.equal('exists');
        expect(result.debugMessages).to.deep.equal(['[D] [MWBOT] Exists: A.png']);
    });
});

describe('batchStatus statusForError()', function () {
    const errorWithCode = (code) => Object.assign(new Error(code), { response: { error: { code } } });

    it('reports an unknown error as error', function () {
        expect(statusForError(new Error('boom'))).to.deep.equal({ status: '[E] ', reason: '', fatal: false });
    });

    it('skips existing pages and unchanged files', function () {
        expect(statusForError(errorWithCode('articleexists'))).to.deep.equal({
            status: '[/] ',
            reason: 'articleexists',
            fatal: false,
        });
        expect(statusForError(errorWithCode('fileexists-no-change')).reason).to.equal('fileexists-no-change');
    });

    it('reports a missing title', function () {
        expect(statusForError(errorWithCode('missingtitle'))).to.deep.equal({
            status: '[?] ',
            reason: 'missingtitle',
            fatal: false,
        });
    });

    it('treats cantedit as an already protected page', function () {
        expect(statusForError(errorWithCode('cantedit'))).to.deep.equal({
            status: '[/] ',
            reason: 'already-protected',
            fatal: false,
        });
    });

    it('treats badtoken as fatal', function () {
        expect(statusForError(errorWithCode('badtoken')).fatal).to.equal(true);
    });
});
