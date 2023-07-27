
const lintCodes = require("./lint-codes.json");

var sprintf = (str, ...argv) => !argv.length ? str :
  sprintf(str = str.replace(sprintf.token || "%", argv.shift()), ...argv);

/**
 * LintResult
 *
 * Holds the results from all the rules capture two arrays of warnings
 * and errors.
 */

class LintResult {

  constructor(ruleId, ruleDescription) {
    this.ruleId = ruleId;
    this.ruleDescription = ruleDescription;
    this.pass = true;
    this.errorCount = 0;
    this.warningCount = 0;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Get the Message Object based on the lintCodes table.  Also, substitures
   * message and recommendation arguments into the warning and recommendation
   * strings based on the percent (%) character.
   */
  getMessageObj(code, messageArgs, recommendationArgs) {
    return {
      code,
      message: sprintf(lintCodes[code]?.message, ...messageArgs),
      type: lintCodes[code]?.type,
      recommendation: sprintf(lintCodes[code]?.recommendation, ...recommendationArgs),
      reference: lintCodes[code]?.reference
    }
  }

  addWarning(code, messageArgs, recommendationArgs) {
    if (lintCodes[code]) {
      this.warnings.push(this.getMessageObj(code, messageArgs || [], recommendationArgs || []));
    } else {
      this.warnings.push(this.getMessageObj("generic-warning", [code], []));
    }

    this.warningCount++;
  }

  addError(code, messageArgs, recommendationArgs) {
    if (lintCodes[code]) {
      this.errors.push(this.getMessageObj(code, messageArgs || [], recommendationArgs || []));
    } else {
      this.errors.push(this.getMessageObj("generic-error", [code], []));
    }

    this.errorCount++;
    this.pass = false;
  }

}

module.exports = LintResult