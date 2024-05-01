const LintRule = require("../../lib/LintRule");
const LintCodes = require("../../config/lint-codes.json");

class IncorrectAnnotationColorRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;

      const annotationNodes = this.getNodesByType("annotationConnector");
      const palette = [
        "#4462edff",
        "#5d00d6ff",
        "#f2f3f4ff",
        "#fffaa0ff",
        "fffaa0ff",
        "50e3c2ff",
        "ffffffff",
      ];

      annotationNodes.forEach((node) => {
        const { data } = node;
        const backgroundColor =
          data.properties?.backgroundColor?.value?.toLowerCase();

        if (!palette.includes(backgroundColor)) {
          this.addError("dv-bp-annotation-001", {
            messageArgs: [data.properties.backgroundColor.value, data.id],
            recommendationArgs: [LintCodes["dv-bp-annotation-001"].reference],
            nodeId: data.id,
          });
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = IncorrectAnnotationColorRule;
