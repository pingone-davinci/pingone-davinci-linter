const LintRule = require("../../LintRule.js")

class ExampleRule extends LintRule {

  runRule() {
    const dvFlow = this.mainFlow;

    const someErrorCondition = false;
    const someWarningCondition = false;

    if (someErrorCondition) {
      this.addError("example-error", [dvFlow.flowId]);
    }

    if (someWarningCondition) {
      this.addWarning("example-warning", [dvFlow.flowId]);
    }
  }
}

module.exports = ExampleRule;