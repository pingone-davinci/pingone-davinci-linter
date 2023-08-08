const LintRule = require("../../LintRule.js")

class ExampleRule extends LintRule {

  runRule() {
    const dvFlow = this.mainFlow;

    const someErrorCondition = false;

    if (someErrorCondition) {
      this.addError("example-error", { messageArgs: [dvFlow.flowId] });
    }
  }
}

module.exports = ExampleRule;