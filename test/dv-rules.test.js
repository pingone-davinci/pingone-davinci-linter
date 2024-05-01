/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const DVLinter = require("pingone-davinci-linter");

const rules = DVLinter.getRules();

const testRuleWithJson = function (rule, tests) {
  tests?.forEach((t) => {
    const testInput = require(`../${t}`);
    const testExpect = require(`../${t.replace(".json", ".expect.json")}`);

    test(`Testing ${rule} with ${t}`, () => {
      const linter = new DVLinter(testInput);
      expect(
        linter.lintFlow({
          includeRules: rule,
        })
      ).toMatchObject(testExpect);
    });
  });
};

Object.keys(rules).forEach((r) => {
  const rule = rules[r];
  rule.tests?.forEach((f) => {
    testRuleWithJson(r, rule.tests);
  });
});
