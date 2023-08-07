const LintRule = require("../../LintRule.js")

class DVRule extends LintRule {

  runRule() {
    this.getNodes(this.mainFlow, "variableConnector");
    const flowVars = new Set(this.getFlowVariables());
    const flowVarRefs = new Set();

    // Create Set of the flow variable references (starting with {{global.flow.variables...)
    flowVars?.forEach((v) => {
      flowVarRefs.add(v.ref);
    })

    // Search the entire flow for any references to {{global.flow.variables...
    var stringToTest = JSON.stringify(this.mainFlow);
    var regexToTest = /\{\{global\.flow\.variables\..[a-zA-Z0-9]*\}\}/g;
    var usedVarRefs = new Set(stringToTest.match(regexToTest));

    usedVarRefs?.forEach((m) => {
      if (!flowVarRefs.has(m)) {
        this.addError("dv-er-variable-002", [m]);
      }
    })

    flowVars?.forEach((v) => {
      if (!usedVarRefs.has(v.ref)) {
        this.addError("dv-er-variable-001", [v.ref]);
      }
    })
  }
}

module.exports = DVRule;