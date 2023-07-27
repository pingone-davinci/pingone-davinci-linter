
const LintResult = require("./LintResult.js");

class LintRule {
  constructor(ruleId, ruleDescription) {
    this.result = new LintResult(ruleId, ruleDescription);
    this.ruleId = ruleId;
    this.ruleDescription = ruleDescription
  }

  addWarning(code, messageArgs, recommendationArgs) {
    this.result.addWarning(code, messageArgs || [], recommendationArgs || []);
  }
  addError(code, messageArgs, recommendationArgs) {
    this.result.addError(code, messageArgs || [], recommendationArgs || []);
  }

  getResults() {
    return this.result;
  }
}

module.exports = LintRule;