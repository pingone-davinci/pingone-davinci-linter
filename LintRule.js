
const DaVinciUtil = require("./DaVinciUtil.js");
const LintResult = require("./LintResult.js");

class LintRule {
  constructor(props) {
    this.mainFlow = props.mainFlow;
    this.allFlows = props.allFlows;
    this.result = new LintResult(props.ruleId, props.ruleDescription);
  }

  setRuleId(ruleId) {
    this.ruleId = ruleId;
  }

  setRuleDescription(ruleDescription) {
    this.ruleDescription = ruleDescription;
  }

  addError(code, props = {}) {
    this.result.addError(code, props);
  }

  getResults() {
    return this.result;
  }

  getFlowVariables() {
    return DaVinciUtil.getFlowVariables(this.mainFlow, "variablesConnector");
  }

  getNodes(nodeType) {
    return DaVinciUtil.getNodes(this.mainFlow, nodeType);
  }

}

module.exports = LintRule;