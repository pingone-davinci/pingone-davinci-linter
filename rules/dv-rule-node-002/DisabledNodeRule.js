const LintRule = require("../../lib/LintRule.js")

class DisabledNodeRule extends LintRule {

  runRule() {
    const dvFlow = this.mainFlow;

    dvFlow.enabledGraphData.elements.nodes.forEach((node) => {
      const data = node.data;

      if (data.isDisabled === true) {
        this.addError("dv-er-node-001", {messageArgs: [`(${data.id})`], nodeId: data.id});
      }
    });
  }
}

module.exports = DisabledNodeRule;