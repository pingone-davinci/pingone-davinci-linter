// test/script.js

const PingOneDaVinciLinter = require('pingone-davinci-linter')

const linter = new PingOneDaVinciLinter();


test('linter version', () => {
  expect(linter.version()).toBe("0.1.0");
});

test('get codes', () => {
  expect(linter.getCodes()).toBeDefined();
});

test('get rules', () => {
  expect(linter.getRules()).toBeDefined();
});
