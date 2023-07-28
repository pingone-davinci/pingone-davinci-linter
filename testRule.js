const DVLinter = require('pingone-davinci-linter')

const linter = new DVLinter();

const rule = "dv-rule-subflow-001";
const test = "test-flow-1.json";

const result = linter.lintFlow({
  "flow": require(`./rules/${rule}/${test}`),
  "rules": [rule]
})

console.log(JSON.stringify(result, null, 2));