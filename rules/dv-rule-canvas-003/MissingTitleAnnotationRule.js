const LintRule = require("../../lib/LintRule");
const LintCodes = require("../../config/lint-codes.json");

class MissingTitleAnnotationRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;

      const annotationNodes = this.getNodesByType("annotationConnector");
      const titleAnnotationColor = "#4462edff";
      let titleNodePresent;

      annotationNodes.forEach((node) => {
        const { data } = node;
        if (data.properties?.backgroundColor?.value === titleAnnotationColor) {
          titleNodePresent = true;
        }
      });

      if (!titleNodePresent) {
        this.addError("dv-bp-missing-title-annotation-001", {
          recommendationArgs: [
            LintCodes["dv-bp-missing-title-annotation-001"].reference,
          ],
        });
      }
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = MissingTitleAnnotationRule;
