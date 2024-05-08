const { log } = require("console");
const LintResult = require("./LintResult");

/**
 * LintRule
 *
 * Provides an interface for creating rules to be used in the PingOneDaVinciLinter engine.
 *
 */
class LintRule {
  mainFlow;
  allFlows;
  codes;

  /**
   *
   * @param {*} props - Properties to be used in constructing a LintRule
   *              mainFlow         - Single flow or MainFlow if multiple flows are linted
   *              allFlows         - Array of all flows.  If single flow, then only 1 flow will be in array
   *              ruleId           - Unique RuleId
   *              ruleDescription  - Description of the rule
   */
  constructor(props = {}) {
    if (this.constructor === LintRule) {
      throw new Error("Cannot instantiate abstract class: LintRule");
    }

    ["id", "description", "reference", "cleans"].forEach((p) => {
      if (props[p] === undefined) {
        log(
          `LintRule: Property '${p}' is required in constructor of ${this.constructor.name}`
        );
        throw new Error(
          `LintRule: Property '${p}' is required in class ${this.constructor.name}`
        );
      }
    });

    this.id = props.id;
    this.description = props.description;
    this.result = new LintResult(this.id, this.description);
    this.cleans = props.cleans;
    this.cleanFlow = props.cleanFlow;
    this.reference = props.reference;

    this.codes = {};
  }

  clear() {
    this.result = new LintResult(this.id, this.description);
  }

  addCode(code, codeProps) {
    this.codes[code] = codeProps;
    this.codes[code].code = code;
  }

  setFlows(mainFlow, allFlows) {
    this.dvUtil.setFlow(mainFlow);
    this.mainFlow = mainFlow;
    this.allFlows = allFlows;
  }

  /**
   * Adds an error to the results.
   *
   * @param {*} codeId  - Result code
   * @param {*} props - Properties to be used when creating error
   */
  addError(codeId, props = {}) {
    if (codeId) {
      const code = this.codes[codeId];

      if (code) {
        this.result.addError(code, props);
      } else {
        this.result.addUnknownCodeError(codeId);
      }
    } else {
      this.result.addError(undefined, props);
    }
  }

  /**
   * Getter for results
   */
  getResults() {
    return this.result;
  }

  setClean(clean) {
    this.cleanFlow = clean;
  }

  addCleanResult(message) {
    this.result.addClean(message);
  }
}

module.exports = LintRule;
