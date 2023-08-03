const DVLinter = require('pingone-davinci-linter')
const fs = require('fs-extra');

const linter = new DVLinter();

const rules = linter.getRules();

const testRuleWithJson = function (rule, testJson, expectJson) {
  test(`Testing ${rule} with ${testJson}`, () => {
    expect(linter.lintFlow({
      "flow": require(`../rules/${rule}/${testJson}`),
      "rules": [rule]
    })).toEqual(require(`../rules/${rule}/${expectJson}`));
  });
}

rules.forEach((r) => {
  const files = fs.readdirSync(`rules/${r}`, { withFileTypes: true });
  files.forEach((f) => {
    if (f.name.endsWith(".json") && !f.name.endsWith(".expect.json")) {
      const testJson = f.name;
      const expectJson = testJson.replace(".json", ".expect.json");
      testRuleWithJson(r, testJson, expectJson);
    }
  })
});

