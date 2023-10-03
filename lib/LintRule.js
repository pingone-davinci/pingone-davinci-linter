const DaVinciUtil = require("./DaVinciUtil");
const LintResult = require("./LintResult");

/**
 * LintRule
 *
 * Provides an interface for creating rules to be used in the PingOneDaVinciLinter engine.
 *
 */
class LintRule {
  mainFlow;
  allFlows;
  ruleId;
  ruleDescription;

  /**
   *
   * @param {*} props - Properties to be used in constructing a LintRule
   *              mainFlow         - Single flow or MainFlow if multiple flows are linted
   *              allFlows         - Array of all flows.  If single flow, then only 1 flow will be in array
   *              ruleId           - Unique RuleId
   *              ruleDescription  - Description of the rule
   */
  constructor(props) {
    if (this.constructor === LintRule) {
      throw new Error("Cannot instantiate abstract class: LintRule");
    }

    ["mainFlow", "ruleId", "ruleDescription"].forEach((p) => {
      if (!props[p]) {
        throw new Error(`LintRule: Property ${p} is required}`);
      }
    });

    if (!(props.allFlows instanceof Array)) {
      throw new Error("LintRule: Property allFlows must be type Array");
    }

    if (!props.mainFlow.flowId) {
      throw new Error("LintRule: Property mainFlow must be a valid flow json");
    }

    this.mainFlow = props.mainFlow;
    this.allFlows = props.allFlows;
    this.result = new LintResult(props.ruleId, props.ruleDescription);
  }

  /**
   * Adds an error to the results.
   *
   * @param {*} code  - Result code
   * @param {*} props - Properties to be used when creating error
   */
  addError(code, props = {}) {
    this.result.addError(code, props);
  }

  /**
   * Getter for results
   */
  getResults() {
    return this.result;
  }

  getFlowVariables() {
    return DaVinciUtil.getFlowVariables(this.mainFlow, "variablesConnector");
  }

  /**
   * Retrieves all nodes in the mainflow matching the nodeType
   *
   * @param {*} nodeType
   * @returns Array of nodes
   */
  getNodesByType(nodeType) {
    return DaVinciUtil.getNodesByType(this.mainFlow, nodeType);
  }

  /**
   * Retrieves all nodes in the mainflow matching the nodeName
   *
   * @param {*} nodeName
   * @returns Array of nodes
   */
  getNodesByName(nodeName) {
    return DaVinciUtil.getNodesByName(this.mainFlow, nodeName);
  }
}

module.exports = LintRule;
