const { default: nodeTest } = require("node:test");
const LintRule = require("../../LintRule.js")

const backgroundColor = {
  httpConnector_createSuccessResponse: "#9dc967",
  httpConnector_createErrorResponse: "#ffc8c1"
}

class DVRule extends LintRule {

  constructor() {
    super("dv-rule-node-001", "Ensure nodes have names/titles");
  }

  //************** */
  runRule(props) {
    const dvFlow = props.dvFlow;

    dvFlow.enabledGraphData.elements.nodes.forEach((node, index, array) => {
      const data = node.data;

      // Check for node title
      if (data.nodeType === "CONNECTION"
        && !data.properties?.nodeTitle?.value
        && !(data.name === "Teleport" && data.capabilityName === "goToNode")) {
        this.addWarning("dv-bp-node-001", [data.id, data.name]);
      }

      // Check for Success/Error JSON background colors
      const connectorCapability = `${data.connectorId}_${data.capabilityName}`;
      if (Object.keys(backgroundColor).find(o => o === `${connectorCapability}`)) {
        if (!data.properties?.backgroundColor?.value.toLowerCase().startsWith(backgroundColor[connectorCapability])) {
          this.addWarning("dv-bp-node-002", [data.properties?.backgroundColor?.value.toLowerCase(), `${data.name} (${data.id}) - ${data.capabilityName}`],
            [backgroundColor[connectorCapability]]);
        }
      }
    });
    //************** */
  }
}

module.exports = DVRule;