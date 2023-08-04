#!/usr/bin/env node
'use strict';

const DVLinter = require('pingone-davinci-linter')
const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');

const linter = new DVLinter();

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

const result = linter.lintFlow({
  flow: require(`./${args.flow}`),
  //rules
})

console.log(JSON.stringify(result, null, 2));


console.log(linter.getTable());