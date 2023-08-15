const lintCodes = require("../lint-codes.json");

const sprintf = (str, ...argv) =>
  !argv.length
    ? str
    : sprintf(str.replace(sprintf.token || "%", argv.shift()), ...argv);

/**
 * LintResult
 *
 * Holds the results from all the rules captured and errors.
 */

class LintResult {
  constructor(ruleId, ruleDescription) {
    this.ruleId = ruleId;
    this.ruleDescription = ruleDescription;
    this.pass = true;
    this.errorCount = 0;
    this.errors = [];
  }

  /**
   * Get the Message Object based on the lintCodes table.  Also, substitures
   * message and recommendation arguments into the message and recommendation
   * strings based on the percent (%) character.
   */
  getMessageObj(code, messageArgs, recommendationArgs, nodeId) {
    const messageObj = {
      code,
      message: sprintf(lintCodes[code]?.message, ...messageArgs),
      type: lintCodes[code]?.type,
      recommendation: sprintf(
        lintCodes[code]?.recommendation,
        ...recommendationArgs
      ),
      reference: lintCodes[code]?.reference,
    };
    if (nodeId) {
      messageObj.nodeId = nodeId;
    }
    return messageObj;
  }

  addError(code, props = {}) {
    if (lintCodes[code]) {
      this.errors.push(
        this.getMessageObj(
          code,
          props.messageArgs || [],
          props.recommendationArgs || [],
          props.nodeId
        )
      );
    } else {
      this.errors.push(this.getMessageObj("generic-error", [code], []));
    }

    this.errorCount++;
    this.pass = false;
  }
}

module.exports = LintResult;
