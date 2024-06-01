/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { version } = require("../package.json");

class PingOneDaVinciLinter {
  rulePacks = [];
  rules = [];
  mainFlow = {};
  allFlows = [];
  lintResponse = {};
  cleanFlow = false;

  /**
   * Create a PineOneDaVinciLinter object with the following properties:
   *  - rulePacks - Array of rule packs to be loaded
   *
   * The rulePacks are loaded dynamically based on the rulePack classes passed.
   *  - linter-davinci-base-pack" (default)
   *
   * @param {*} props
   */
  constructor(props) {
    const { rulePacks } = props;

    rulePacks.forEach((RulePackClass) => {
      this.rulePacks.push(new RulePackClass());
    });
  }

  /**
   * Performs a require a module based on the moduleName.
   *
   * The moduleName should be one of:
   *  - A module that has been installed locally or globally
   *  - A path to a module
   *
   * If the module can't be found then it will attempt to look in the
   * parent directory.
   *
   * If the module can't be found, then it will result in throwing an error.
   *
   * @param {*} moduleName
   * @returns module
   */
  static requireWithRetry(directory, moduleName) {
    try {
      // Try to require the module normally
      console.log("Trying to require: ", moduleName);
      return require(moduleName);
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND") {
        // If the module is not found, prepend '../' and try again
        try {
          return require(`${directory}/${moduleName}`);
        } catch (innerError) {
          // If it fails again, throw the original error
          throw error;
        }
      } else {
        // If the error is not related to module not being found, throw it
        throw error;
      }
    }
  }

  /**
   * Private function to set the flow in the linter which will parse the flow JSON
   * and set the main flow and all flows associated with it.  When a flow with multiple
   * flows are include, it represents a parent flow with multiple subflows.
   *
   * @param {*} flow
   */
  #setFlow(flow) {
    this.allFlows = [];

    if (!flow) {
      throw new Error("Flow JSON is required");
    }

    // Check for single-flow
    if (flow.flowId) {
      this.allFlows.push(flow);
      this.mainFlow = flow;
    } else if (flow.flows) {
      this.allFlows = flow.flows;
      // eslint-disable-next-line prefer-destructuring
      this.mainFlow = flow.flows[0];
    }
  }

  /**
   * Return a string of all the rules based on the returnType from all the
   * rulePacks.
   *  - table (default) - A textual table version of the rules
   *  - json - A json struct of of the rules
   */
  getRules(returnType = "table") {
    let rulesTable = "";
    const rulesJson = [];

    this.rulePacks.forEach((rulePack) => {
      if (returnType === "json") {
        rulesJson.push(rulePack.getRules());
      } else {
        rulesTable += rulePack.getRulesTable();
      }
    });

    if (returnType === "json") {
      return JSON.stringify(rulesJson, null, 2);
    }
    return rulesTable;
  }

  /**
   * Get codes table
   */
  getCodes(returnType = "table") {
    let codesTable = "";
    const codesJson = [];

    this.rulePacks.forEach((rulePack) => {
      if (returnType === "json") {
        codesJson.push(rulePack.getCodes());
      } else {
        codesTable += rulePack.getCodesTable();
      }
    });

    if (returnType === "json") {
      return JSON.stringify(codesJson, null, 2);
    }
    return codesTable;
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
  lintFlow(flow, props = {}) {
    this.#setFlow(flow);
    const ruleProps = props;

    try {
      this.lintResponse = {
        name: "PingOne DaVinci Linter",
        datetime: new Date().toString(),
        version: `v${version}`,
        pass: true,
        errorCount: 0,
        rulePackResults: [],
        clean: false,
      };

      this.cleanFlow = props.cleanFlow || false;

      this.rulePacks.forEach((rulePack) => {
        const rulePackResult = rulePack.lintFlow(
          this.mainFlow,
          this.allFlows,
          ruleProps
        );

        this.lintResponse.rulePackResults.push(rulePackResult);
        this.lintResponse.pass = this.lintResponse.pass && rulePackResult.pass;
        this.lintResponse.clean =
          this.lintResponse.clean || rulePackResult.clean;

        this.lintResponse.errorCount += rulePackResult.errorCount;
      });

      return this.lintResponse;
    } catch (err) {
      throw new Error(err);
      // throw new Error(err.message);
    }
  }

  /**
   * getTable - get the table results
   */
  getTable(props) {
    let output = "";
    this.rulePacks.forEach((rulePack) => {
      output += `${rulePack.getResultTable(props)}\n`;
    });
    return output;
  }
}

module.exports = PingOneDaVinciLinter;
