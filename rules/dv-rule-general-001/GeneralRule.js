/* eslint-disable no-param-reassign */
const LintRule = require("../../lib/LintRule");
// const DVUtils = require("../../lib/DaVinciUtil");

class ExampleRule extends LintRule {
  runRule() {
    try {
      const { mainFlow, allFlows } = this;

      allFlows.forEach((f) => {
        // Blank out companyId and customerId
        if (this.cleanFlow) {
          if (f.companyId !== "") {
            f.companyId = "";
            this.addCleanResult("Removed companyId value");
          }
          if (f.customerId !== "") {
            f.customerId = "";
            this.addCleanResult("Removed customerId value");
          }
        }

        // Blank out sktemplate
        if (this.cleanFlow) {
          f?.graphData?.elements?.nodes?.forEach((node) => {
            const { properties } = node.data;
            if (properties?.sktemplate) {
              delete properties.sktemplate;
              this.addCleanResult("Removed sktemplate");
            }
          });
        }

        // Clean LogLevel
        if (this.cleanFlow) {
          const { settings } = f;
          if (settings && settings.logLevel !== 2) {
            settings.logLevel = 2;
            this.addCleanResult("Set logLevel to INFO (2)");
          }
        }
      });
    } catch (err) {
      this.addError("generic-error", { messageArgs: [`${err}`] });
    }
  }
}

module.exports = ExampleRule;
