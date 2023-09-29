const LintRule = require("../../lib/LintRule");

class DVRule extends LintRule {
  runRule() {
    try {
      const flowVars = new Set(this.getFlowVariables());
      const flowVarRefs = new Set();

      // Create Set of the flow variable references (starting with {{global.flow.variables...)
      flowVars?.forEach((v) => {
        flowVarRefs.add(v.ref);
      });

      // Search the entire flow for any references to {{global.flow.variables...
      const stringToTest = JSON.stringify(this.mainFlow);
      const regexToTest = /\{\{global\.flow\.variables\..[a-zA-Z0-9]*\}\}/g;
      const usedVarRefs = new Set(stringToTest.match(regexToTest));

      usedVarRefs?.forEach((m) => {
        if (!flowVarRefs.has(m)) {
          this.addError("dv-er-variable-002", { messageArgs: [m] });
        }
      });

      flowVars?.forEach((v) => {
        if (!usedVarRefs.has(v.ref)) {
          this.addError("dv-er-variable-001", { messageArgs: [v.ref] });
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = DVRule;
