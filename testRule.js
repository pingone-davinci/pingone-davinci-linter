const DVLinter = require('pingone-davinci-linter')

const linter = new DVLinter();

const rules = ["dv-rule-subflow-001"]; //"dv-rule-subflow-001";
const test = "CIAM-Passwordless-000-Demo_Export.json"; //./rules/${rule}/${test}

const result = linter.lintFlow({
  flow: require(`./${test}`),
  //rules
})

console.log(JSON.stringify(result, null, 2));


console.log(linter.getTable());