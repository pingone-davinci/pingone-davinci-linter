#!/usr/bin/env node
'use strict';

const DVLinter = require('pingone-davinci-linter')
const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');

const parser = new ArgumentParser({
  description: 'lintflow example'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('flow', {
  metavar: 'FLOW',
  help: 'lint the flow file'
});

const args = parser.parse_args();

console.log(`
--------------------------------
 Linting Flow: ${args.flow}
--------------------------------
`);

const linter = new DVLinter(require(`./${args.flow}`));

const result = linter.lintFlow()

console.log(JSON.stringify(result, null, 2));


console.log(linter.getTable());