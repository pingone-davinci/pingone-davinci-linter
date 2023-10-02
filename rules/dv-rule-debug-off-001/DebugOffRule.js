const LintRule = require("../../lib/LintRule");

class DebugOffRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;

      /* Checks the flow settings to determine if debug is on (loglevel === 3) or off (loglevel === 1 or 2) */
      if (dvFlow.settings?.logLevel === 3) {
        this.addError("dv-bp-debug-off-001");
      }
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = DebugOffRule;
