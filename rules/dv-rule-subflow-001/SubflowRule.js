const LintRule = require("../../lib/LintRule");
const DVUtils = require("../../lib/DaVinciUtil");

class DVRule extends LintRule {
  // Check a child subflow to make sure it doesn't point back to this flow ID
  isCircularSubflow(subflows, flowId) {
    const flowDetail = subflows.find((v) => v.flowId === flowId);
    return flowDetail !== undefined;
  }

  runRule() {
    try {
      const targetFlow = this.mainFlow;
      const supportingFlows = this.allFlows;

      if (!supportingFlows) {
        return;
      }

      // Create SubFlow Details
      const subflows = DVUtils.getSubFlows(targetFlow, supportingFlows);
      subflows?.forEach((subflow) => {
        if (!subflow.name) {
          this.addError("dv-er-subflow-001", { messageArgs: [subflow.flowId] });
        } else {
          if (subflow.name !== subflow.label) {
            this.addError("dv-er-subflow-001", {
              messageArgs: [subflow.flowId],
            });
          }
          // Check for circular subflow dependencies
          if (
            this.isCircularSubflow(
              DVUtils.getSubFlows(subflow.detail, supportingFlows),
              targetFlow.flowId
            )
          ) {
            this.addError("dv-er-subflow-002", {
              messageArgs: [subflow.name, targetFlow.name],
            });
          }
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = DVRule;
