const LintRule = require("../../lib/LintRule.js")

class TeleportRule extends LintRule {

  runRule() {
    const startNodes = {};
    const gotoNodes = [];

    // Get teleport start nodes and goto nodes
    this.mainFlow?.enabledGraphData.elements.nodes.forEach((node) => {
      if (node.data?.connectorId?.match("nodeConnector")  && node.data?.capabilityName?.match("startNode")) {
        startNodes[node.data.id] = node.data.properties?.nodeTitle?.value;
      }
      if (node.data?.connectorId?.match("nodeConnector")  && node.data?.capabilityName?.match("goToNode")) {
        gotoNodes.push(node.data.properties?.nodeInstanceId?.value);
      }
    });

    // If there is a start node that is not referenced by a go to, generate an error for that node
    for (const nodeId in startNodes) {
      gotoNodes.includes(nodeId) || this.addError("dv-er-teleport-001", { messageArgs: [`${startNodes[nodeId]} (${nodeId})`] })
    }
  }
}

module.exports = TeleportRule;