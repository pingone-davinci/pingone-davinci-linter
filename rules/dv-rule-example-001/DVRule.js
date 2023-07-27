const LintRule = require("../../LintRule.js")

class DVRule extends LintRule {

  constructor() {
    super("dv-rule-example-001", "Example Rule");
  }

  runRule(props) {
    const dvSummary = props.dvSummary;
    const dvFlow = props.dvFlow;
    const flowId = props.flowId;

    if (!dvSummary) return;

    // This rule is fairly simple and will just use the summary file, and not dig through the raw flow JSON, although
    // that is avalable via "dvFlow" variable
    // Get the current flow summary and do something with it
    const flowDetail = dvSummary.flowsDetail.find(v => v.flowInfo.flowId === flowId);

    const someErrorCondition = false;
    const someWarningCondition = false;

    if (someErrorCondition) {
      this.addError("example-error", [flowId]);
    }

    if (someWarningCondition) {
      this.addWarning("example-warning", [flowId]);
    }
  }
}

module.exports = DVRule;