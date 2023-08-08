
const { table } = require('table');
const { version } = require('./package.json');
const color = require('colors');
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
    const data = [];

    data.push(["ID".bold, "Type".bold, "Description".bold, "Reference".bold, "Message".bold, "Recommendation".bold]);

    for (const id in lintCodes) {
      const code = lintCodes[id];
      data.push(
        [
          id || "",
          code.type || "",
          code.description || "",
          code.reference || "",
          code.message || "",
          code.recommendation || "",
        ]
      );
    }

    const config = {
      header: {
        alignment: 'center',
        content: `PingOne DaVinci Linter Codes (v${version})`.green.bold
      },
      columns: {
        // 0: { width: 18 },
        // 1: {
        //   wrapWord: true,
        //   width: 15
        // },
        2: {
          wrapWord: true,
          width: 30
        },
        3: {
          wrapWord: true,
          width: 30
        },
        4: {
          wrapWord: true,
          width: 30
        },
        5: {
          wrapWord: true,
          width: 30
        }
      }
    }

    return table(data, config);
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
    const data = [];

    data.push(["ID".bold, "Description".bold, "RuleJS".bold, "Tests".bold]);

    for (const id in lintRules) {
      const rule = lintRules[id];
      data.push(
        [
          id || "",
          rule.description || "",
          rule.ruleJS || "",
          rule.tests || ""
        ]
      );
    }

    const config = {
      header: {
        alignment: 'center',
        content: `PingOne DaVinci Linter Rules (v${version})`.green.bold
      },
      columns: {
        0: { width: 20 },
        1: {
          wrapWord: true,
          width: 30
        },
        2: {
          wrapWord: true,
          width: 30
        },
        3: {
          wrapWord: true,
          width: 30
        }
      }
    }

    return table(data, config);
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
      this.lintResponse = {
        datetime: (new Date()).toString(),
        pass: true,
        errorCount: 0
      };

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
          errors: [],
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
            for (const err of response.errors) {
              ruleResponse.errors.push(err.message);
            }
            if (response.pass === false) {
              ruleResponse.pass = false;
            }
            ruleResponse.ruleResults.push(response);

            // Aggregate lintResults
            this.lintResponse.pass = this.lintResponse.pass && response.pass;
            this.lintResponse.errorCount += response.errorCount;
          } catch (err) {
            console.log(`Rule '${rulePath}' not found in rules directory or error`);
            console.log(`     ERROR: `, err.message);
          }

        }
        // Add the results from this flowId to the return array
        lintResults.push(ruleResponse);

      }

      this.lintResponse.lintResults = lintResults;
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

    const data = [];
    const spanningCells = [];
    let row = 0;

    data.push(["Result".bold, "Flow/Rule".bold, "".bold]);
    spanningCells.push({
      col: 1, row, colSpan: 2
    })
    row++;

    for (const lintResult of this.lintResponse.lintResults) {
      data.push(
        [
          lintResult.pass ? "PASS".green : "FAIL".red,
          lintResult.flowName,
          ""
        ]
      );
      spanningCells.push({
        col: 1, row, colSpan: 2
      })
      row++;

      for (const ruleResult of lintResult.ruleResults) {

        data.push(
          [
            ruleResult.pass ? "PASS".green : "FAIL".red,
            "→ " + ruleResult.ruleId,
            ""
          ]
        )
        spanningCells.push({
          col: 1, row, colSpan: 2
        })
        row++

        for (const e of [...ruleResult.errors]) {
          data.push(
            [
              e.code,
              "",
              e.type.bold + " - " + e.message + "\n" +
              e.recommendation
            ]
          )
          spanningCells.push({
            col: 0, row, colSpan: 2, alignment: 'right'
          })
          row++;
        }
      }
    }

    const config = {
      header: {
        alignment: 'center',
        content: `PingOne DaVinci Linting (v${version})`.green.bold + "\n\n" +

          this.lintResponse.datetime
      },
      columns: {
        0: { width: 6, alignment: 'center' },
        1: {
          wrapWord: true,
          width: 20
        },
        2: {
          wrapWord: true,
          width: 80
        },
        3: {
          wrapWord: true,
          width: 30
        }
      },
      spanningCells
    }

    return table(data, config);

  }
}

module.exports = PingOneDaVinciLinter