const { table, getBorderCharacters } = require("table");
const color = require("colors");
const { version } = require("../package.json");
const lintCodes = require("../config/lint-codes.json");
const lintRules = require("../config/lint-rules.json");
const DaVinciUtil = require("./DaVinciUtil");

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

    data.push([
      "ID".bold,
      "Type".bold,
      "Description".bold,
      "Reference".bold,
      "Message".bold,
      "Recommendation".bold,
    ]);

    Object.entries(lintCodes).forEach(([key, code]) => {
      data.push([
        key || "",
        code.type || "",
        code.description || "",
        code.reference || "",
        code.message || "",
        code.recommendation || "",
      ]);
    });

    const config = {
      header: {
        alignment: "center",
        content: `PingOne DaVinci Linter Codes (v${version})`.green.bold,
      },
      columns: {
        2: {
          wrapWord: true,
          width: 30,
        },
        3: {
          wrapWord: true,
          width: 30,
        },
        4: {
          wrapWord: true,
          width: 30,
        },
        5: {
          wrapWord: true,
          width: 30,
        },
      },
    };

    return table(data, config);
  }

  /**
   * read all rules in rules directory and build array based on the file
   * @param {*} path
   * @returns Array
   */
  static getRules(path = `${__dirname}/rules`) {
    return lintRules;
  }

  /**
   * Get rules table
   */
  static getRulesTable() {
    const data = [];

    data.push(["ID".bold, "Description".bold, "RuleJS".bold]);

    Object.keys(lintRules).forEach((id) => {
      const rule = lintRules[id];
      data.push([id || "", rule.description || "", rule.ruleJS || ""]);
    });

    const config = {
      header: {
        alignment: "center",
        content: `PingOne DaVinci Linter Rules (v${version})`.green.bold,
      },
      columns: {
        0: { width: 24 },
        1: {
          wrapWord: true,
          width: 40,
        },
        2: {
          wrapWord: true,
          width: 40,
        },
      },
    };

    return table(data, config);
  }

  // Get the rules that will be applied taking into account include/exclude/ignore options
  // from either the command line options or variables in the flow itself
  getRulesToRun(commandLineProps, flowProps) {
    let runRules = [];
    let ignore = [];
    let index;

    // Start with all the existing rules
    runRules = Object.keys(this.rules);

    // Give the command line options precedence over rules defined in flow variables
    if (commandLineProps?.includeRules) {
      runRules = commandLineProps.includeRules.split(/\s*,\s*/);
    }
    if (commandLineProps?.excludeRules) {
      commandLineProps.excludeRules.split(/\s*,\s*/).forEach((r) => {
        index = runRules.indexOf(r);
        if (index !== -1) {
          runRules.splice(index, 1);
        }
      });
    }
    if (commandLineProps?.ignoreRules) {
      ignore = commandLineProps.ignoreRules.split(/\s*,\s*/);
    }
    // Honor options found in the flow, if no command line option
    if (!commandLineProps?.includeRules && flowProps?.includeRules) {
      runRules = flowProps.includeRules;
    }
    if (!commandLineProps?.excludeRules && flowProps?.excludeRules) {
      flowProps.excludeRules.forEach((r) => {
        index = runRules.indexOf(r);
        if (index !== -1) {
          runRules.splice(index, 1);
        }
      });
    }
    if (!commandLineProps?.ignoreRules && flowProps?.ignoreRules) {
      ignore = flowProps.ignoreRules;
    }

    return { runRules, ignore };
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
    try {
      this.lintResponse = {
        datetime: new Date().toString(),
        pass: true,
        errorCount: 0,
      };

      const lintResults = [];
      let ruleResponse;

      this.allFlows?.forEach((f) => {
        if (!f.enabledGraphData) {
          // eslint-disable-next-line no-param-reassign
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
          ruleResults: [],
          rulesIgnored: [],
        };

        // Get rules to run and ignore based on either command line options or flow variables
        const { runRules, ignore } = this.getRulesToRun(
          props,
          DaVinciUtil.getFlowLinterOptions(f)
        );

        // Apply lint rules to the target flow
        runRules.forEach((ruleId) => {
          const rule = this.rules[ruleId];
          const rulePath = `../${rule.ruleJS}`;

          try {
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const DVRule = require(`${rulePath}`);
            const dvRule = new DVRule({
              mainFlow: f,
              allFlows: this.allFlows,
              ruleId,
              ruleDescription: rule.description,
            });

            dvRule.runRule();

            const response = dvRule.getResults();

            ruleResponse.rulesApplied.push(ruleId);

            if (ignore && ignore.includes(ruleId)) {
              ruleResponse.rulesIgnored.push(ruleId);
              response.pass = true;
              response.ruleIgnored = true;
            } else {
              ruleResponse.errorCount += response.errorCount;

              response.errors.forEach((err) => {
                ruleResponse.errors.push(err.message);
              });
            }

            if (response.pass === false) {
              ruleResponse.pass = false;
            }
            ruleResponse.ruleResults.push(response);

            // Aggregate lintResults
            this.lintResponse.pass = this.lintResponse.pass && response.pass;

            if (!response.ruleIgnored) {
              this.lintResponse.rulesIgnored = true;
              this.lintResponse.errorCount += response.errorCount;
            }
          } catch (err) {
            console.log(
              `Rule '${rulePath}' not found in rules directory or error
ERROR: ${err.message}`
            );
          }
        });
        // Add the results from this flowId to the return array
        lintResults.push(ruleResponse);
      });

      this.lintResponse.lintResults = lintResults;
      return this.lintResponse;
    } catch (err) {
      throw new Error(err);
      // throw new Error(err.message);
    }
  }

  /**
   * handleGetTableProps
   */
  #handleGetTableProps(props) {
    if (props?.color === false) {
      color.disable();
    }
    this.borderCharacters = props?.border ? props.border : "honeywell";
  }
  /**
   * getTable - get the table results
   */
  getTable(props) {
    const data = [];
    const spanningCells = [];
    this.#handleGetTableProps(props);
    let row = 0;

    // HEADER
    data.push(["Result".bold, "Flow/Rule".bold, "".bold]);
    spanningCells.push({
      col: 1,
      row,
      colSpan: 2,
    });
    row++;

    // OVERALL Results
    data.push([
      this.lintResponse.pass ? "PASS".green : "FAIL".red,
      "--- OVERALL ---",
      "",
    ]);
    spanningCells.push({
      col: 1,
      row,
      colSpan: 2,
    });
    row++;
    this.lintResponse.lintResults.forEach((lintResult) => {
      data.push([
        lintResult.pass ? "PASS".green : "FAIL".red,
        lintResult.flowName,
        "",
      ]);
      spanningCells.push({
        col: 1,
        row,
        colSpan: 2,
      });
      row++;

      lintResult.ruleResults.forEach((ruleResult) => {
        data.push([
          ruleResult.pass ? "PASS".green : "FAIL".red,
          `→ ${ruleResult.ruleId}`,
          "",
        ]);
        spanningCells.push({
          col: 1,
          row,
          colSpan: 2,
        });
        row++;

        [...ruleResult.errors].forEach((e) => {
          data.push([
            e.code,
            "",
            // eslint-disable-next-line prettier/prettier
            `${e.type.bold} - ${e.message}${"\nrecommendation".bold} - ${e.recommendation
            }`,
          ]);
          spanningCells.push({
            col: 0,
            row,
            colSpan: 2,
            alignment: "right",
          });
          row++;
        });
      });
    });

    const config = {
      header: {
        alignment: "center",
        content: `${`PingOne DaVinci Linting (v${version})`.green.bold}

${this.lintResponse.datetime}`,
      },
      columns: {
        0: {
          width: 6,
          alignment: "center",
        },
        1: {
          wrapWord: true,
          width: 20,
        },
        2: {
          wrapWord: true,
          width: 80,
        },
        3: {
          wrapWord: true,
          width: 30,
        },
      },
      spanningCells,
      border: getBorderCharacters(this.borderCharacters),
    };

    return table(data, config);
  }
}

module.exports = PingOneDaVinciLinter;
