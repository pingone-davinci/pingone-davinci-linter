const LintRule = require("../../LintRule.js")

class DVRule extends LintRule {

  init() {
    this.setRuleId("dv-rule-example-001");
    this.setRuleDescription("Example Rule")
  }

  runRule() {
    const dvFlow = this.singleFlow;

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

module.exports = DVRule;