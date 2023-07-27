// test/script.js

const PingOneDaVinciLinter = require('pingone-davinci-linter')

const linter = new PingOneDaVinciLinter();

const flow01 = require("./flow-01.json");
const flow01_expect = require("./flow-01.expect.json");

test('linter version', () => {
  expect(linter.lintFlow({
    "flow": flow01,
    "rules": ["dv-rule-node-001"]
  })).toEqual(flow01_expect);
});
