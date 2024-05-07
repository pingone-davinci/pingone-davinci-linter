const LintRule = require("../../../lib/LintRule");

class ExampleRule extends LintRule {
  constructor() {
    super({
      id: "dv-rule-example-001",
      description: "Example Rule",
      cleans: false,
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
