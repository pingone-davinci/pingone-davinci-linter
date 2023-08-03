
const Table = require('cli-table');
const colors = require('colors');
const lintCodes = require("./lint-codes.json");
const fs = require("fs-extra");

class PingOneDaVinciLinter {
  rules = [];
  lintResponse = {};

  constructor() {
    this.rules = this.getRules();
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
  getRules(path = __dirname + "/rules") {
    const files = fs.readdirSync(path, { withFileTypes: true });
    let rules = [];
    files.forEach((f) => {
      if (f.isDirectory()) {
        rules.push(f.name);
      }
    });

    return rules;
  }

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

    let flows = [];

    // Check for single-flow
    if (flow.flowId) {
      flows.push(flow);
    } else if (flow.flows) {
      flows = flow.flows;
    }

    try {
      let lintResults = [];
      let ruleResponse;

      for (const f of flows) {
        if (!f.enabledGraphData) {
          f.enabledGraphData = f.graphData;
        }

        // Start building the linter response object for this flowId
        ruleResponse = {
          flowId: f.flowId,
          flowName: f.name,
          pass: true,
          errorCount: 0,
          warningCount: 0,
          errors: [],
          warnings: [],
          rulesApplied: [],
          ruleResults: []
        };

        // Apply lint rules to the target flow
        for (const rule of rules) {
          const rulePath = `./rules/${rule}/DVRule.js`;

          try {
            const DVRule = require(`${rulePath}`);
            const dvRule = new DVRule();

            dvRule.runRule({
              dvFlow: f,
              dvFlows: flow.flows // If undefined, then singleFlow, else we have multipleFlows
            });
            const response = dvRule.getResults();

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
        lintResults.push(ruleResponse);

      }

      this.lintResponse = {
        lintResults
      }
      return this.lintResponse;
    } catch (err) {
      throw new Error(err);
      // throw new Error(err.message);
    }
  }

  /**
   * getTable - get the table results
   */
  getTable() {
    var table = new Table();

    var table = new Table(
      {
        head: ["Result", "Flow/Rule", ""],
        colWidths: [8, 30, 80],
        colAligns: [],
        style: {
          compact: false,  // includes border
          head: ['bold']
        }
      });

    for (const lintResult of this.lintResponse.lintResults) {
      // console.log(lintResult);
      for (const ruleResult of lintResult.ruleResults) {
        table.push(
          [
            lintResult.pass ? "PASS".green : "FAIL".red,
            lintResult.flowName,
            ""
          ]
        );

        for (const e of [...ruleResult.errors]) {
          table.push(
            [
              "FAIL".red,
              "  " + e.code,
              e.type + " - " + e.message + "\n" +
              e.recommendation
            ]
          )
        }
        for (const e of [...ruleResult.errors, ...ruleResult.warnings]) {
          table.push(
            [
              "WARN".yellow,
              "  " + e.code,
              e.type + " - " + e.message + "\n" +
              e.recommendation
            ]
          )
        }
      }
    }

    return table.toString();
  }
}

module.exports = PingOneDaVinciLinter