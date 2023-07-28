const DVLinter = require('pingone-davinci-linter')

const linter = new DVLinter();

const rule = "dv-rule-logo-001";

const result = linter.lintFlow({
  "flow": require(`./rules/${rule}/${rule}.json`),
  "rules": [rule]
})

console.log(JSON.stringify(result, null, 2));