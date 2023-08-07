
const LintResult = require("./LintResult.js");

class LintRule {
  constructor(props) {
    this.singleFlow = props.singleFlow;
    this.allFlows = props.allFlows;
    this.init();
    this.result = new LintResult(this.ruleId, this.ruleDescription);
  }

  setRuleId(ruleId) {
    this.ruleId = ruleId;
  }

  setRuleDescription(ruleDescription) {
    this.ruleDescription = ruleDescription;
  }

  init(props) {
    this.singleFlow = props.singleFlow;
    this.allFlows = props.allFlows;
  }

  addWarning(code, messageArgs, recommendationArgs) {
    this.result.addWarning(code, messageArgs || [], recommendationArgs || []);
  }
  addError(code, messageArgs, recommendationArgs) {
    this.result.addError(code, messageArgs || [], recommendationArgs || []);
  }

  getResults() {
    return this.result;
  }

  getFlowVariables() {
    const varNodes = this.getNodes("variablesConnector")

    const flowVariables = [];

    // console.log(varNodes);
    for (const node of varNodes) {
      // varNodes.foreach((node) => {
      for (const flowVar of node?.data?.properties?.saveFlowVariables?.value) {
        flowVariables.push({
          name: flowVar.name,
          ref: `{{global.flow.variables.${flowVar.name}}}`,
          type: flowVar.type,
          value: flowVar.value
        });
      };
    }

    return flowVariables;
  }

  getNodes(nodeType) {
    return this.singleFlow?.enabledGraphData.elements.nodes.filter(
      (node) => node.data.connectorId === nodeType
    );
  }

}

module.exports = LintRule;