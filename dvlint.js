#!/usr/bin/env node
'use strict';

const DVLinter = require('pingone-davinci-linter')
const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');

const parser = new ArgumentParser({
  description: 'lintflow example'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('-f', '--flow', {
  metavar: 'FLOW',
  help: 'lint the flow file'
});
parser.add_argument('-i', '--includeRule', { help: 'specify specific rule to include' });
// parser.add_argument('-e', '--excludeRule', { help: 'specify specific rule to exclude' });
parser.add_argument('-j', '--json', { help: 'return json in output', action: "store_true" });
parser.add_argument('-t', '--table', { help: 'return table in output. DEFAULT', default: true, action: "store_true" });
parser.add_argument('-c', '--lintCodes', { help: 'print lint codes table', action: "store_true" });
parser.add_argument('-r', '--lintRules', { help: 'print lint rules table', action: "store_true" });

const args = parser.parse_args();



if (args.flow) {
  if (args.table) {
    console.log(`
  --------------------------------
   Linting Flow: ${args.flow}
           Rule: ${args.includeRule || "ALL"}
  --------------------------------
  `);
  }

  const linter = new DVLinter(require(`./${args.flow}`));
  const result = linter.lintFlow(
    {
      rules: args.includeRule ? [args.includeRule] : undefined
    }
  )

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else if (args.table) {
    console.log(linter.getTable());
  }
}

if (args.lintCodes) {
  if (args.json) {
    console.log(DVLinter.getCodes());
  } else if (args.table) {
    console.log(DVLinter.getCodesTable());
  }
}

if (args.lintRules) {
  if (args.json) {
    console.log(DVLinter.getRules());
  } else if (args.table) {
    console.log(DVLinter.getRulesTable());
  }
}