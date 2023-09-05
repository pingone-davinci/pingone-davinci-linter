const LintRule = require("../../lib/LintRule.js")

class MultiStartRule extends LintRule {

  runRule() {
    // Types of nodes to ignore in the edges check
    const ignoreNodeTypes = ["nodeConnector", "annotationConnector"];
    let notTargets = [];

    this.mainFlow?.enabledGraphData.elements.nodes.forEach((node) => {
      const nodeId = node.data?.id;
      const nodeType = node.data?.connectorId;
      // If this type of node is not in the ignore list, check the edges to see if it is listed as a target
      if (! ignoreNodeTypes.includes(nodeType) && (this.mainFlow?.enabledGraphData?.elements?.edges?.length > 0)) {
        const targets = this.mainFlow?.enabledGraphData?.elements?.edges.filter((edgeNode) =>
          edgeNode.data?.target?.match(nodeId));
        if (targets.length === 0) {
          notTargets.push({nodeId, nodeType});
        }
      } 
    });
    // Should only ever be one node that is not listed as a target, otherwise it is a potential multiple start point, or a floater
    if (notTargets.length > 1) {
      notTargets.forEach((node) => this.addError("dv-er-multi-start-001", { messageArgs: [`${node.nodeId} (${node.nodeType})`] }));
    }
  }
}

module.exports = MultiStartRule;