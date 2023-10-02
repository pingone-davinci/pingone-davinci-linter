const LintRule = require("../../lib/LintRule");

class AdvancedRoutingRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;
      /* Checks the flow settings to determine if advanced routing is on (useBetaAlgorithm === true) or off (useBetaAlgorithm === false) */
      if (!dvFlow.settings?.useBetaAlgorithm === true) {
        this.addError("dv-rule-advanced-routing-001");
      }
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = AdvancedRoutingRule;
