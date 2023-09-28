const LintRule = require("../../lib/LintRule.js")

class DebugOffRule extends LintRule {

  runRule() {
    const dvFlow = this.mainFlow;
    const flowId = dvFlow.flowId;

    // console.log(dvFlow.settings.logLevel);

    /* Checks the flow settings to determine if debug is on (loglevel === 3) or off (loglevel === 1 or 2) */
    dvFlow.settings?.logLevel !== 3 || this.addError("dv-bp-debug-off-001");

  }
}

module.exports = DebugOffRule;
