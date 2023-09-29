const LintRule = require("../../lib/LintRule");

class DisabledNodeRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;

      dvFlow?.enabledGraphData?.elements?.nodes?.forEach((node) => {
        const { data } = node;

        if (data.isDisabled === true) {
          this.addError("dv-er-node-001", {
            messageArgs: [`(${data.id})`],
            nodeId: data.id,
          });
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = DisabledNodeRule;
