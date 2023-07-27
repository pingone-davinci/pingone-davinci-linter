
const LintRule = require("../../LintRule.js")

class DVRule extends LintRule {
  constructor() {
    super("dv-rule-subflow-001", "Checks for subflow name mismatches");
  }

  runRule(props) {
    const dvSummary = props.dvSummary;
    const dvFlow = props.dvFlow;
    const flowId = props.flowId;

    if (!dvSummary) return;

    // This rule is fairly simple and will just use the summary file, and not dig through the raw flow JSON
    const flowDetail = dvSummary.flowsDetail.find(v => v.flowInfo.flowId === flowId);

    // Create SubFlow Details
    const subflows = flowDetail.subFlows;

    for (const subflow of subflows) {
      // console.log(`Rule subflowCheck:  Checking subflow ${subflow.flowId}...`);
      if (!subflow.name) {
        result.addError("dv-er-subflow-001", [subflow.flowId]);
      } else {
        if (subflow.name != subflow.label) {
          this.addError("dv-er-subflow-001", [subflow.flowId]);
        }
        // Check for circular subflow dependencies
        if (isCircularSubflow(dvSummary, flowId, subflow.flowId)) {
          this.addWarning("dv-er-subflow-002", [subflow.name, flowDetail.name]);
        }
      }
    }
  }
}

// Check a child subflow to make sure it doesn't point back to this flow ID
function isCircularSubflow(dvSummary, flowId, subFlowId) {
  const flowDetail = dvSummary.flowsDetail.find(v => v.flowInfo.flowId === subFlowId);
  const subflows = flowDetail.subFlows;
  for (const subflow of subflows) {
    if (subflow.flowId === flowId) {
      return true;
    }
  }
  return false;
}

module.exports = DVRule;