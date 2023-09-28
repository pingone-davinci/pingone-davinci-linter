const LintRule = require("../../lib/LintRule.js")

class AdvancedRoutingRule extends LintRule {

  runRule() {
    const dvFlow = this.mainFlow;

    // console.log(dvFlow.settings?.useBetaAlgorithm);

    /* Checks the flow settings to determine if advanced routing is on (useBetaAlgorithm === true) or off (useBetaAlgorithm === false) */
    dvFlow.settings?.useBetaAlgorithm == true || this.addError("dv-rule-advanced-routing-001");

  }
}

module.exports = AdvancedRoutingRule;