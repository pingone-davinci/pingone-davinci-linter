
const Table = require('cli-table');
const colors = require('colors');
const lintCodes = require("./lint-codes.json");
const lintRules = require("./lint-rules.json");
const fs = require("fs-extra");
const DaVinciUtil = require('./DaVinciUtil');

class PingOneDaVinciLinter {
  rules = [];
  mainFlow = {};
  allFlows = [];
  lintResponse = {};

  constructor(flow) {
    this.rules = PingOneDaVinciLinter.getRules();

    if (!flow) {
      throw new Error("Flow JSON is required");
    }

    // Check for single-flow
    if (flow.flowId) {
      this.allFlows.push(flow);
    } else if (flow.flows) {
      this.allFlows = flow.flows;
    }
    this.mainFlow = flow;
  }

  /**
   * Gets the lint codes JSON
   * @returns Array
   */
  static getCodes() {
    return lintCodes;
  }

  /**
   * Get codes table
   */
  static getCodesTable() {
    var table = new Table(
      {
        head: ["ID", "Type", "Message", "Description", "Reference", "Recommendation"],
        colWidths: [20, 15, 40, 20, 20, 20],
        colAligns: [],
        style: {
          compact: false,  // includes border
          head: ['bold']
        }
      });

    for (const id in lintCodes) {
      const code = lintCodes[id];

      table.push(
        [
          id || "",
          code.type || "",
          code.message || "",
          code.description || "",
          code.reference || "",
          code.recommendation || "",
        ]
      );
    }

    return table.toString();
  }

  /**
   * read all rules in rules directory and build array based on the file
   * @param {*} path
   * @returns Array
   */
  static getRules(path = __dirname + "/rules") {
    return lintRules;
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
   * Get rules table
   */
  static getRulesTable() {
    var table = new Table(
      {
        head: ["ID", "Description", "RuleJS", "Tests"],
        colWidths: [25, 25, 40, 40],
        colAligns: [],
        style: {
          compact: false,  // includes border
          head: ['bold']
        }
      });

    for (const id in lintRules) {
      const rule = lintRules[id];
      console.log(rule);
      table.push(
        [
          id || "",
          rule.description || "",
          rule.ruleJS || "",
          rule.tests || ""
        ]
      );
    }

    return table.toString();
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
  lintFlow(props = {}) {
    let rules = this.rules;
    if (props.rules) {
      const newRules = {};
      props.rules.forEach((r) => {
        newRules[r] = this.rules[r];
      });
      rules = newRules;
    } else {
      rules = this.rules;
    }

    try {
      let lintResults = [];
      let ruleResponse;

      for (const f of this.allFlows) {
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

        // Get list of included, excluded, and ignored rules from the flow variable _Flow Linter_
        const flowLinterOptions = DaVinciUtil.getFlowLinterOptions(f);

        // Apply lint rules to the target flow
        for (const ruleId in rules) {
          const rule = rules[ruleId];

          if (flowLinterOptions.includeRules && !flowLinterOptions.includeRules.includes(ruleId)) {
            continue;
          }
          if (flowLinterOptions.excludeRules && flowLinterOptions.excludeRules.includes(ruleId)) {
            continue;
          }

          const rulePath = `./${rule.ruleJS}`;

          try {
            const DVRule = require(`${rulePath}`);
            const dvRule = new DVRule({
              mainFlow: f,
              allFlows: this.allFlows,
              ruleId: ruleId,
              ruleDescription: rule.description
            });

            dvRule.runRule();

            const response = dvRule.getResults();

            ruleResponse.rulesApplied.push(ruleId);
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
      table.push(
        [
          lintResult.errorCount ? "PASS".green : "FAIL".red,
          lintResult.flowName,
          ""
        ]
      );
      for (const ruleResult of lintResult.ruleResults) {

        table.push(
          [
            ruleResult.pass ? "PASS".green : "FAIL".red,
            "  " + ruleResult.ruleId,
            ""
          ]
        )

        for (const e of [...ruleResult.errors, ...ruleResult.warnings]) {
          table.push(
            [
              "", //e.type === "error" ? "FAIL".red : "WARN".yellow,
              "    " + e.code,
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