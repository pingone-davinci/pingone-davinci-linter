const LintRule = require("../../LintRule.js")

class LogoRule extends LintRule {

  runRule() {
    const dvFlow = this.mainFlow;
    const flowId = dvFlow.flowId;

    // console.log('Logo Check Rule');
    // console.log(JSON.stringify(dvFlow, null, 2));
    // Check for custom CSS enabled
    dvFlow.settings?.useCustomCSS || this.addWarning("dv-bp-logo-001", [flowId]);
    // Check for companyLogo class in custom CSS
    dvFlow.settings?.css?.includes(".companyLogo") || this.addWarning("dv-bp-logo-002", [flowId]);

    // Search for companyLogo environment variable
    dvFlow.graphData?.elements?.nodes?.forEach((node, index, array) => {
      const data = node.data;

      if (data.connectorId === "variablesConnector") {
        // console.log("Found variables connector");
        data.properties?.saveVariables?.value?.forEach((obj) => {
          // console.log("Checking name " + obj.name);
          if (obj.name === "companyLogo") {
            this.addWarning("dv-bp-logo-003", [flowId]);
          }
        });
      }
    });
  }
}

module.exports = LogoRule;