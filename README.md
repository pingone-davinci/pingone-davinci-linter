pingone-davinci-linter  ![example workflow](https://github.com/pingone-davinci/pingone-davinci-linter/actions/workflows/tests.yml/badge.svg)
=========

This package allows for the linting of PingOne DaVinci flows (as exported from DaVinci) against a known set of
rules and return codes.

## Features

- Set of flows to check for errors, best-pratices, syntax, security, ... issues with PingOne DaVinci flows.
- `dvlint.js` CLI tool to run the linter utilities
  - `dvlint.js -f FLOW` to lint a flow stored in the FLOW file
  - `dvlint.js -r` to get all the avaiable rules
  - `dvlint.js -c` to get all the available codes
  - Both JSON and table formats

## Installation

```bash
npm install pingone-davinci-linter
```

