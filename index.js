
const lintCodes = require("./lint-codes.json");
const fs = require("fs-extra");

class PingOneDaVinciLinter {
  rules = [];

  constructor() {
    this.rules = this.getRules();
  }

  version() {
    return "0.1.0";
  }

  /**
   * Gets the lint codes JSON
   * @returns Array
   */
  getCodes() {
    return lintCodes;
  }

  /**
   * read all rules in rules directory and build array based on the file
   * @param {*} path
   * @returns Array
   */
  getRules(path = "rules") {
    const files = fs.readdirSync(path, { withFileTypes: true });
    let rules = [];
    files.forEach((f) => {
      if (f.isDirectory()) {
        rules.push(f.name);
      }
    });

    return rules;
  }

  // Flow linter
  /**
   * Lints a flow passed based on properties
   *
   * props may consist of:
   *   - flow     - DaVinci Flow JSON, as exported from DaVinci
   *   - rules    - Rules array.  If not passed, then all available rules will be run
   * @param {*} props
   * @returns
   */
  lintFlow(props) {
    let rules = props.rules || this.rules;
    const flow = props.flow;

    if (!flow) {
      throw new Error("Flow JSON is required");
    }

    try {
      let ruleResponseArr = [];
      let ruleResponse;

      if (!flow.enabledGraphData) {
        flow.enabledGraphData = flow.graphData;
      }

      // Start building the linter response object for this flowId
      ruleResponse = {
        flowId: flow.flowId,
        flowName: flow.name,
        pass: true,
        errorCount: 0,
        warningCount: 0,
        errors: [],
        warnings: [],
        rulesApplied: [],
        ruleResults: []
      };

      // Apply lint rules to the target flow
      // Will pass in the summary object because it contains info about all the connections etc, flow JSON for the target flow, and the flow ID
      for (const rule of rules) {
        const rulePath = `./rules/${rule}/DVRule.js`;

        // console.log("Running Rule: ", rule);
        try {
          const DVRule = require(`${rulePath}`);
          const dvRule = new DVRule();

          dvRule.runRule({ dvFlow: flow });
          const response = dvRule.getResults();

          // console.log(`DEBUG response = ${ JSON.stringify(response) }`);
          ruleResponse.rulesApplied.push(rule);
          ruleResponse.errorCount += response.errorCount;
          ruleResponse.warningCount += response.warningCount;
          for (const err of response.errors) {
            ruleResponse.errors.push(err.message);
          }
          for (const warning of response.warnings) {
            ruleResponse.warnings.push(warning.message);
          }
          if (response.pass === false) {
            ruleResponse.pass = false;
          }
          ruleResponse.ruleResults.push(response);
        } catch (err) {
          console.log(`Rule '${rulePath}' not found in rules directory or error`);
          console.log(`     ERROR: `, err.message);
        }

      }
      // Add the results from this flowId to the return array
      ruleResponseArr.push(ruleResponse);

      let lintResponse;
      lintResponse = {
        lintResults: ruleResponseArr
      }
      return lintResponse;
    } catch (err) {
      throw new Error(err);
      // throw new Error(err.message);
    }
  }
}


module.exports = PingOneDaVinciLinter

