const LintRule = require("../../lib/LintRule");
const LintCodes = require("../../config/lint-codes.json")

class TitleNotOnTopRule extends LintRule {
  runRule() {
    try {
      const annotationType = "annotationConnector";
      const annotationColor = "#4462edff";

      const flowNodeTypes = this.getFlowNodeTypes();
      let nodeTopYCoord = Number.MAX_SAFE_INTEGER;

      // Ensure annotationConnector is in list of nodes
      if (flowNodeTypes && flowNodeTypes.includes(annotationType)) {
        flowNodeTypes.forEach((nodeType) => {
          if (nodeType === annotationType) {
            return; // Skip annotation nodes
          }
          const nodesByType = this.getNodesByType(nodeType);
          if (nodesByType) {
            nodesByType.forEach((node) => {
              const { position } = node;
              // Capture the node with the smallest y coord
              if (position.y < nodeTopYCoord) {
                nodeTopYCoord = position.y;
              }
            });
          }
        });

        const annotationNodes = this.getNodesByType(annotationType);
        const titleAnnotation = annotationNodes.filter((obj) => obj.data?.properties?.backgroundColor?.value === annotationColor);

        if (titleAnnotation.length > 0) {
          const { position, data } = titleAnnotation[0];
          if (position?.y > nodeTopYCoord) {
            this.addError("dv-bp-title-not-on-top-001", {
              messageArgs: [data.id],
              nodeId: data.id,
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error occurred: ${err}`);
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = TitleNotOnTopRule;
