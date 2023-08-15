const LintRule = require("../../lib/LintRule.js")

const backgroundColor = {
  httpConnector_createSuccessResponse: "#9dc967",
  httpConnector_createErrorResponse: "#ffc8c1"
}

class NodeRule extends LintRule {

  runRule() {
    const dvFlow = this.mainFlow;

    dvFlow.enabledGraphData.elements.nodes.forEach((node, index, array) => {
      const data = node.data;

      // Check for node title
      if (data.nodeType === "CONNECTION"
        && !data.properties?.nodeTitle?.value
        && !(data.name === "Teleport" && data.capabilityName === "goToNode")) {
        this.addError("dv-bp-node-001", { messageArgs: [data.id, data.name], nodeId: data.id });
      }

      // Check for Success/Error JSON background colors
      const connectorCapability = `${data.connectorId}_${data.capabilityName}`;
      if (Object.keys(backgroundColor).find(o => o === `${connectorCapability}`)) {
        if (!data.properties?.backgroundColor?.value.toLowerCase().startsWith(backgroundColor[connectorCapability])) {
          this.addError("dv-bp-node-002",
            {
              messageArgs: [data.properties?.backgroundColor?.value.toLowerCase(), `${data.name} (${data.id}) - ${data.capabilityName}`],
              recommendationArgs: [backgroundColor[connectorCapability]],
              nodeId: data.id
            });
        }
      }
    });
  }
}

module.exports = NodeRule;