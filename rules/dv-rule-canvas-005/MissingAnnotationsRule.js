const LintRule = require("../../lib/LintRule");

class MissingAnnotationsRule extends LintRule {
  runRule() {
    try {
      const annotationType = "annotationConnector";
      const flowNodeTypes = this.getFlowNodeTypes();

      if (!flowNodeTypes.includes(annotationType)) {
        this.addError("dv-bp-annotation-003", {});

      }
    } catch (err) {
      console.error(`Error occurred: ${err}`);
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = MissingAnnotationsRule;
