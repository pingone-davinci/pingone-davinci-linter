// test/script.js

const PingOneDaVinciLinter = require('pingone-davinci-linter')

// const linter = new PingOneDaVinciLinter();

test('get codes', () => {
  expect(PingOneDaVinciLinter.getCodes()).toBeDefined();
});

test('get rules', () => {
  expect(PingOneDaVinciLinter.getRules()).toBeDefined();
});
