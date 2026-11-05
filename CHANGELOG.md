# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/) and
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Breaking Changes
- mwbot is now an ES module (`import MWBot from 'mwbot'`). `require('mwbot')` keeps returning the class on Node.js 22.13 and later [`657bb79`](https://github.com/gesinn-it-pub/mwbot/commit/657bb79) ([#84](https://github.com/gesinn-it-pub/mwbot/issues/84))
- Require Node.js 22.13 or later (was 20) [`657bb79`](https://github.com/gesinn-it-pub/mwbot/commit/657bb79) ([#84](https://github.com/gesinn-it-pub/mwbot/issues/84))

### Changed
- Bump p-map from 4.0.0 to 7.1.1; it is exposed as `MWBot.map`

## [2.4.0] - 2026-11-05

Modernizes the internals and tightens `batch()`. The public API is otherwise unchanged.

### Changed
- Allow only the documented operations in `batch()` jobs (`create`, `createProtect`, `read`, `readFromID`, `readWithProps`, `readWithPropsFromID`, `edit`, `editProtect`, `update`, `updateFromID`, `delete`, `protect`, `move`, `upload`, `uploadOverwrite`); other methods can no longer be called through a job [`be15107`](https://github.com/gesinn-it-pub/mwbot/commit/be15107)
- Reject `batch()` with an error and stop processing when a job uses an unsupported operation [`c0a4230`](https://github.com/gesinn-it-pub/mwbot/commit/c0a4230)
- Report errors of `rawRequest()` and `upload()` always as rejected promises instead of synchronous exceptions [`1c25d76`](https://github.com/gesinn-it-pub/mwbot/commit/1c25d76) [`7aa91e1`](https://github.com/gesinn-it-pub/mwbot/commit/7aa91e1)
- Bump tough-cookie from 5.1.2 to 6.0.2 [`99eec66`](https://github.com/gesinn-it-pub/mwbot/commit/99eec66) ([#78](https://github.com/gesinn-it-pub/mwbot/pull/78))

### Fixed
- Stop printing the edit token to the console when a batch job fails with `badtoken` [`db2ad4f`](https://github.com/gesinn-it-pub/mwbot/commit/db2ad4f)

[Unreleased]: https://github.com/gesinn-it-pub/mwbot/compare/2.4.0...HEAD
[2.4.0]: https://github.com/gesinn-it-pub/mwbot/compare/2.3.3...2.4.0
