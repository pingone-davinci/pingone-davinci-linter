const { log } = require("console");
const fs = require("fs");
const { table, getBorderCharacters } = require("table");
const color = require("colors");
const DaVinciUtil = require("./DaVinciUtil");

class LintRulePack {
  constructor(props = {}) {
    [
      "directory",
      "version",
      "name",
      "description",
      "homepage",
      "author",
    ].forEach((p) => {
      if (!props[p]) {
        throw new Error(
          `LintRule: Property '${p}' is required in class ${this.constructor.name}`
        );
      }
    });

    this.dvUtil = new DaVinciUtil();

    this.directory = props.directory;
    this.version = props.version;
    this.name = props.name;
    this.description = props.description;
    this.homepage = props.homepage;
    this.author = props.author;
    this.rules = [];

    this.rulesDir = `${this.directory}/rules`;

    const directories = fs
      .readdirSync(this.rulesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    directories.forEach((directory) => {
      const ruleDir = `${this.rulesDir}/${directory}`;
      const rules = fs
        .readdirSync(ruleDir, { withFileTypes: true })
        .filter((dirent) => dirent.isFile() && dirent.name.endsWith("Rule.js"))
        .map((dirent) => dirent.name);

      rules.forEach((rule) => {
        this.addRule(rule, `${ruleDir}/${rule}`);
      });
    });
  }

  addRule(rule, rulePath) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const Rule = require(rulePath);
      const inst = new Rule();
      inst.directory = `${this.rulesDir}/${inst.id}`;
      inst.dvUtil = this.dvUtil;
      this.rules.push(inst);
    } catch (err) {
      // console.log(err);
      // console.log(`Error loading rule ${rulePath}`);
    }
  }

  getRules() {
    const rulesJson = {
      name: this.name,
      description: this.description,
      version: this.version,
      rules: [],
    };

    this.rules.forEach((rule) => {
      rulesJson.rules.push({
        id: rule.id,
        description: rule.description,
        codes: rule.codes,
        reference: rule.reference,
        cleans: rule.cleans,
      });
    });
    return rulesJson;
  }

  displayRules() {
    this.rules.forEach((rule) => {
      log(rule.id, rule.description);
    });
  }

  /**
   * Get rules table
   */
  getRulesTable() {
    const data = [];

    data.push(["ID".bold, "Description".bold, "Reference".bold, "Cleans".bold]);

    this.rules.forEach((rule) => {
      data.push([
        rule.id || "",
        rule.description || "",
        rule.reference || "",
        rule.cleans ? "Yes" : "No",
      ]);
    });

    const config = {
      header: this.#getTableHeader(),
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
        3: {
          wrapWord: false,
          width: 6,
        },
      },
    };

    return table(data, config);
  }

  getCodes() {
    return this.getRules();
  }

  #getTableHeader() {
    return {
      alignment: "center",
      content:
        `Rule Pack ${`${this.name} (v${this.version})`.green.bold}` +
        `\n${this.author}\n${this.homepage}`,
    };
  }
  /**
   * Get codes table
   */
  getCodesTable() {
    const data = [];

    data.push([
      "Rule ID/Code".bold,
      "Type".bold,
      "Description".bold,
      "Message".bold,
      "Recommendation".bold,
    ]);

    this.rules.forEach((rule) => {
      Object.entries(rule.codes)?.forEach(([key, code]) => {
        data.push([
          `${rule.id}\n${key}` || "",
          code.type || "",
          code.description || "",
          code.message || "",
          code.recommendation || "",
        ]);
      });
    });

    const config = {
      header: this.#getTableHeader(),
      columns: {
        2: {
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
   * handleGetTableProps
   */
  #handleGetTableProps(props) {
    if (props?.color === false) {
      color.disable();
    }
    this.borderCharacters = props?.border ? props.border : "honeywell";
  }
  /**
   * getResultTable - get the table results
   */
  getResultTable(props) {
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
        const ignoreInd = ruleResult.ruleIgnored ? "(ignored)".green : "";
        const cleanInd = ruleResult.clean ? "(cleaned)".green : "";
        data.push([
          ruleResult.pass ? "PASS".green : "FAIL".red,
          `→ ${ruleResult.ruleId} ${ignoreInd} ${cleanInd}`,
          "",
        ]);
        spanningCells.push({
          col: 1,
          row,
          colSpan: 2,
        });
        row++;

        [...ruleResult.errors].forEach((e) => {
          // TODO - Add nodeId
          data.push([
            e.code,
            "",
            // eslint-disable-next-line prettier/prettier
            `${e.type.bold} - ${e.message}${"\nrecommendation".bold} - ${e.recommendation
            }${e.reference ? `\n${`reference`.bold} - ${e.reference}` : ""}`,
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
      header: this.#getTableHeader(),
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

  // Get the rules that will be applied taking into account include/exclude/ignore options
  // from either the command line options or variables in the flow itself
  getRulesToRun(commandLineProps, flowProps) {
    let runRules = [];
    let ignore = [];
    let index;

    // Start with all the existing rules
    runRules = this.rules.map((rule) => rule.id);

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
  lintFlow(mainFlow, allFlows, props = {}) {
    this.dvUtil.setFlow(mainFlow);

    try {
      const rulePackResponse = {
        name: this.name,
        version: `v${this.version}`,
        pass: true,
        errorCount: 0,
        lintResults: [],
        clean: false,
      };

      this.cleanFlow = props.cleanFlow || false;

      // Start building the rulePack response object for this flowId
      const ruleResponse = {
        flowId: mainFlow.flowId,
        flowName: mainFlow.name,
        pass: true,
        errorCount: 0,
        errors: [],
        rulesApplied: [],
        ruleResults: [],
        rulesIgnored: [],
      };

      // Get rules to run and ignore based on either command line options or flow variables
      // const ignore = undefined;
      const { runRules, ignore } = this.getRulesToRun(
        props,
        this.dvUtil.getFlowLinterOptions()
      );

      // Apply lint rules to the target flow
      this.rules.forEach((rule) => {
        // If the rule is not in the list of rules to run, then skip it
        if (runRules.includes(rule.id)) {
          rule.setClean(this.cleanFlow);
          rule.setFlows(mainFlow, allFlows);

          try {
            rule.clear();
            rule.runRule();

            const response = rule.getResults();

            ruleResponse.rulesApplied.push(rule.id);

            if (ignore && ignore.includes(rule.id)) {
              ruleResponse.rulesIgnored.push(rule.id);
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
            } else if (rule.reference) {
              ruleResponse.reference = rule.reference;
            }
            ruleResponse.ruleResults.push(response);

            // Aggregate lintResults
            rulePackResponse.pass = rulePackResponse.pass && response.pass;

            // Aggregate clean
            rulePackResponse.clean = rulePackResponse.clean || response.clean;

            if (!response.ruleIgnored) {
              rulePackResponse.rulesIgnored = true;
              rulePackResponse.errorCount += response.errorCount;
            }
          } catch (err) {
            log("LintRulePack-lintFlow", err);
          }
        }
      });
      // Add the results from this flowId to the return array
      rulePackResponse.lintResults.push(ruleResponse);

      this.lintResponse = rulePackResponse;
      return rulePackResponse;
    } catch (err) {
      throw new Error(err);
      // throw new Error(err.message);
    }
  }
}

module.exports = LintRulePack;
