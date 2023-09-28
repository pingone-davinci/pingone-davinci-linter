const LintRule = require("../../lib/LintRule.js");

class EmptyFlow extends LintRule {
  runRule() {
    const dvFlow = this.mainFlow;

    if (Object.keys(dvFlow.enabledGraphData.elements).length === 0) {
      this.addError("dv-er-empty-flow-001");
    }
  }
}

module.exports = EmptyFlow;
