# Changelog

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/) and
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [3.0.0] - 2026-11-05

mwbot is now an ES module and requires Node.js 22.13 or later. `require('mwbot')` keeps working on Node.js 22.13 and later. Version 2.x stays available on the `2.x` branch and receives security fixes.

### Breaking Changes
- mwbot is now an ES module (`import MWBot from 'mwbot'`). `require('mwbot')` keeps returning the class on Node.js 22.13 and later [`657bb79`](https://github.com/gesinn-it-pub/mwbot/commit/657bb79) ([#84](https://github.com/gesinn-it-pub/mwbot/issues/84))
- Require Node.js 22.13 or later (was 20) [`657bb79`](https://github.com/gesinn-it-pub/mwbot/commit/657bb79) ([#84](https://github.com/gesinn-it-pub/mwbot/issues/84))

### Changed
- Bump p-map from 4.0.0 to 7.1.1; it is exposed as `MWBot.map` [`34c7545`](https://github.com/gesinn-it-pub/mwbot/commit/34c7545)

## [3.0.0-rc.1] - 2026-11-05

Release candidate for 3.0.0. mwbot is now an ES module and requires Node.js 22.13 or later. Please test it before the final release: `npm install mwbot@next`.

### Breaking Changes
- mwbot is now an ES module (`import MWBot from 'mwbot'`). `require('mwbot')` keeps returning the class on Node.js 22.13 and later [`657bb79`](https://github.com/gesinn-it-pub/mwbot/commit/657bb79) ([#84](https://github.com/gesinn-it-pub/mwbot/issues/84))
- Require Node.js 22.13 or later (was 20) [`657bb79`](https://github.com/gesinn-it-pub/mwbot/commit/657bb79) ([#84](https://github.com/gesinn-it-pub/mwbot/issues/84))

### Changed
- Bump p-map from 4.0.0 to 7.1.1; it is exposed as `MWBot.map` [`34c7545`](https://github.com/gesinn-it-pub/mwbot/commit/34c7545)

[Unreleased]: https://github.com/gesinn-it-pub/mwbot/compare/3.0.0...HEAD
[3.0.0]: https://github.com/gesinn-it-pub/mwbot/compare/2.4.0...3.0.0
[3.0.0-rc.1]: https://github.com/gesinn-it-pub/mwbot/compare/2.4.0...3.0.0-rc.1

Older releases: [2.x](CHANGELOG-2.x.md)
