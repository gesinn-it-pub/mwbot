'use strict';

/**
 * Determines the log status of a successful batch job.
 *
 * @param {string} operation Name of the batch operation
 * @param {object} response  API response of the job
 *
 * @returns {{status: string, reason: string, debugMessages: string[]}}
 */
function statusForResponse(operation, response) {
    let status = '[=] ';
    let reason = '';
    const debugMessages = [];

    if (operation === 'delete') {
        status = '[-] ';
    } else if (response.edit?.new === '') {
        status = '[+] ';
    } else if (response.edit?.newrevid) {
        status = '[C] ';
    } else if (response.query?.pages?.['-1']) {
        status = '[?] ';
        reason = 'missing';
    } else if (response.query?.pages) {
        status = '[S] ';
    } else if (response.upload?.result === 'Success') {
        status = '[S] ';
    } else if (response.upload?.result === 'Warning') {
        status = '[/] ';
        if (response.upload.warnings?.duplicate) {
            reason = 'duplicate';
            debugMessages.push('[D] [MWBOT] Duplicate: ' + response.upload.warnings.duplicate.join(', '));
        }
        if (response.upload.warnings?.exists) {
            reason = 'exists';
            debugMessages.push('[D] [MWBOT] Exists: ' + response.upload.warnings.exists);
        }
    }

    return { status, reason, debugMessages };
}

/**
 * Determines the log status of a failed batch job.
 *
 * @param {Error} err Error of the job
 *
 * @returns {{status: string, reason: string, fatal: boolean}}
 *          fatal is true if the processing of further jobs has to be cancelled
 */
function statusForError(err) {
    let status = '[E] ';
    let reason = '';
    let fatal = false;

    const code = err.response?.error?.code;
    if (code === 'articleexists' || code === 'fileexists-no-change') {
        status = '[/] ';
        reason = code;
    } else if (code === 'missingtitle') {
        status = '[?] ';
        reason = code;
    } else if (code === 'cantedit') {
        // cantedit from action=protect means the page is already protected
        // at a level the bot cannot change. The content edit already
        // succeeded → idempotent, treat as non-fatal skip.
        status = '[/] ';
        reason = 'already-protected';
    } else if (code === 'badtoken') {
        fatal = true;
    }

    return { status, reason, fatal };
}

module.exports = { statusForResponse, statusForError };
