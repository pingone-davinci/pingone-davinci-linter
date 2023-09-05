const DaVinciUtil = require("./DaVinciUtil");
const LintResult = require("./LintResult");

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

  getNodesByType(nodeType) {
    return DaVinciUtil.getNodesByType(this.mainFlow, nodeType);
  }

  getNodesByName(nodeName) {
    return DaVinciUtil.getNodesByType(this.mainFlow, nodeName);
  }
}

module.exports = LintRule;
