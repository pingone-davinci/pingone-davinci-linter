const LintRule = require("../../lib/LintRule");

class EmptyFlow extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;

      if (Object.keys(dvFlow.enabledGraphData.elements).length === 0) {
        this.addError("dv-er-empty-flow-001");
      }
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = EmptyFlow;
