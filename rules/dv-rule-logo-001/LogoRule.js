const LintRule = require("../../lib/LintRule");
const DVUtils = require("../../lib/DaVinciUtil");

class LogoRule extends LintRule {
  runRule() {
    try {
      const dvFlow = this.mainFlow;
      const { allFlows } = this;

      // Ignore this rule in subflows, CSS should be applied at the main flow level
      if (DVUtils.getAllSubFlows(allFlows).includes(dvFlow.flowId)) {
        return;
      }
      // Check for custom CSS enabled
      if (!dvFlow.settings?.useCustomCSS) {
        this.addError("dv-bp-logo-001");
      }
      // Check for companyLogo class in custom CSS
      if (!dvFlow.settings?.css?.includes(".companyLogo")) {
        this.addError("dv-bp-logo-002");
      }

      // Search for companyLogo environment variable
      dvFlow.graphData?.elements?.nodes?.forEach((node) => {
        const { data } = node;

        if (data.connectorId === "variablesConnector") {
          data.properties?.saveVariables?.value?.forEach((obj) => {
            if (obj.name === "companyLogo") {
              this.addError("dv-bp-logo-003", {
                nodeId: data.id,
              });
            }
          });
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = LogoRule;
