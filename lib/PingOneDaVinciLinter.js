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
   *  - directory - Directory where rule packs are located
   *  - rulePacks - Array of rule packs to be loaded
   * The rulePacks are loaded dynamically based on the string passed and a subsequent require
   * using the rules of a javascript rule pack.  Examples include:
   *  - "pingone-davinci-linter-base-pack" (default)
   *  - "/Users/jsmith/projects/my-rule-pack"
   *  - "github://myorg/my-rule-pack"
   *
   * @param {*} props
   */
  constructor(props) {
    const { directory, rulePacks } = props;

    rulePacks.forEach((rulePack) => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const RulePack = require(rulePack);

      this.rulePacks.push(new RulePack());
    });
  }

  /**
   * Private function to set the flow in the linter which will parse the flow JSON
   * and set the main flow and all flows associated with it.  When a flow with multiple
   * flows are include, it represents a parent flow with multiple subflows.
   *
   * @param {*} flow
   */
  #setFlow(flow) {
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

    this.allFlows.forEach((f) => {
      if (!f.enabledGraphData) {
        let { enabledGraphData } = f;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enabledGraphData = f.graphData;
      }
    });

    if (!this.mainFlow.enabledGraphData) {
      this.mainFlow.enabledGraphData = this.mainFlow.graphData;
    }
  }

  /**
   * Get rules table
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
