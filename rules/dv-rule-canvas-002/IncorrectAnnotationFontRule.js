const LintRule = require("../../lib/LintRule");
const LintCodes = require("../../config/lint-codes.json");

class IncorrectAnnotationColorRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;

      const annotationNodes = this.getNodesByType("annotationConnector");
      const fontFamily = "sans-serif";

      annotationNodes.forEach((node) => {
        const { data } = node;
        if (
          data.properties?.fontFamily?.value?.toLowerCase() !==
          fontFamily.toLowerCase()
        ) {
          this.addError("dv-bp-annotation-002", {
            messageArgs: [data.properties.fontFamily.value, data.id],
            recommendationArgs: [LintCodes["dv-bp-annotation-001"].reference],
            nodeId: data.id,
          });

          if (this.cleanFlow) {
            data.properties.fontFamily.value = fontFamily;
            this.addCleanResult(
              "Set annotation font to sans-serif",
              data.id,
              "fontFamily"
            );
          }
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = IncorrectAnnotationColorRule;
