// test/script.js

const PingOneDaVinciLinter = require('pingone-davinci-linter')

const linter = new PingOneDaVinciLinter();

test('get codes', () => {
  expect(linter.getCodes()).toBeDefined();
});

test('get rules', () => {
  expect(linter.getRules()).toBeDefined();
});
