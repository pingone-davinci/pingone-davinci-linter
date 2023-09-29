const LintRule = require("../../lib/LintRule");

class TeleportRule extends LintRule {
  runRule() {
    try {
      const startNodes = {};
      const gotoNodes = [];

      // Get teleport start nodes and goto nodes
      this.mainFlow?.enabledGraphData?.elements?.nodes?.forEach((node) => {
        if (
          node.data?.connectorId?.match("nodeConnector") &&
          node.data?.capabilityName?.match("startNode")
        ) {
          startNodes[node.data.id] = node.data.properties?.nodeTitle?.value;
        }
        if (
          node.data?.connectorId?.match("nodeConnector") &&
          node.data?.capabilityName?.match("goToNode")
        ) {
          gotoNodes.push(node.data.properties?.nodeInstanceId?.value);
        }
      });

      // If there is a start node that is not referenced by a go to, generate an error for that node
      Object.entries(startNodes).forEach(([nodeId, nodeTitle]) => {
        if (!gotoNodes.includes(nodeId)) {
          this.addError("dv-er-teleport-001", {
            messageArgs: [`${nodeTitle} (${nodeId})`],
          });
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = TeleportRule;
