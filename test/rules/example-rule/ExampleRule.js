const LintRule = require("../../../lib/LintRule");

class ExampleRule extends LintRule {
  constructor() {
    super({
      id: "example-rule",
      description: "Example Rule",
      cleans: false,
      reference: "https://example-reference-rule/doc",
    });

    this.addCode("example-error", {
      description: "Example Rule Description",
      message: "Example Rule of flow '%'",
      type: "best-practice",
      recommendation: "We recommend this example.",
    });
  }

  runRule() {
    try {
      const dvFlow = this.mainFlow;
      const someErrorCondition = false;

      // Variation where this rule is ignored in any subflows
      // const { allFlows } = this;
      // if (DVUtils.getAllSubFlows(allFlows).includes(dvFlow.flowId)) {
      //   return;
      // }

      if (someErrorCondition) {
        this.addError("example-error", { messageArgs: [dvFlow.flowId] });
      }
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = ExampleRule;
