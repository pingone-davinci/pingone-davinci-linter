const LintRule = require("../../LintRule.js")

class DVRule extends LintRule {

  constructor() {
    super("dv-rule-example-001", "Example Rule");
  }

  runRule(props) {
    const dvFlow = props.dvFlow;

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