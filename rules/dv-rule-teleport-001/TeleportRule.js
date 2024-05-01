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
        } else {
          // Check if the goto node has the correct input schema
          const gotoNodeInputSchema =
            this.getNodeById(nodeId).data.properties.inputSchema?.value;

          let gotoNodeInputSchemaJSON = {};
          if (gotoNodeInputSchema) {
            gotoNodeInputSchemaJSON = JSON.parse(gotoNodeInputSchema);
          }

          // Get all nodes with the instanceId of the goto node
          const nodes =
            this.mainFlow?.enabledGraphData?.elements?.nodes?.filter((node) =>
              node.data?.properties?.nodeInstanceId?.value?.match(nodeId)
            );

          nodes?.forEach((node) => {
            // get all schema items from properties, except nodeInstanceId
            const callingSchema = Object.keys(node.data.properties).filter(
              (prop) => prop !== "nodeInstanceId"
            );

            callingSchema.forEach((attrName) => {
              if (gotoNodeInputSchemaJSON.properties[attrName] === undefined) {
                this.addError("dv-er-teleport-002", {
                  messageArgs: [attrName],
                });

                if (this.cleanFlow) {
                  const { data } = node;
                  delete data.properties[attrName];
                  this.addCleanResult(
                    `Removed teleport goto node attribute ${attrName}`
                  );
                }
              }
            });
          });
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = TeleportRule;
