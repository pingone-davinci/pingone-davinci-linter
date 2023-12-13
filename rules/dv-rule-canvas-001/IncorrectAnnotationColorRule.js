const LintRule = require("../../lib/LintRule");
const LintCodes = require("../../config/lint-codes.json")

class IncorrectAnnotationColorRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;


      const annotationNodes = this.getNodesByType("annotationConnector");
      const palette = ["#4462edff", "#5d00d6ff", "#e7e7e7ff", "#fffaa0ff"]

      annotationNodes.forEach((node) => {
        const { data } = node;
        if (!palette.includes(data.properties?.backgroundColor?.value)) {
          this.addError("dv-bp-annotation-001", {
            messageArgs: [`${data.properties.backgroundColor.value}`],
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
