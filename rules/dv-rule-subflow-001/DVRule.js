
const LintRule = require("../../LintRule.js")

class DVRule extends LintRule {

  init() {
    this.setRuleId("dv-rule-subflow-001");
    this.setRuleDescription("Checks for subflow name mismatches")
  }

  runRule() {
    const targetFlow = this.mainFlow;
    const supportingFlows = this.allFlows;

    if (!supportingFlows) {
      return;
    }

    // Create SubFlow Details
    const subflows = getSubFlows(targetFlow, supportingFlows);

    for (const subflow of subflows) {
      if (!subflow.name) {
        this.addError("dv-er-subflow-001", [subflow.flowId]);
      } else {
        if (subflow.name != subflow.label) {
          this.addError("dv-er-subflow-001", [subflow.flowId]);
        }
        // Check for circular subflow dependencies
        if (isCircularSubflow(getSubFlows(subflow.detail, supportingFlows), targetFlow.flowId)) {
          this.addError("dv-er-subflow-002", [subflow.name, targetFlow.name]);
        }
      }
    }
  }
}

// Check a child subflow to make sure it doesn't point back to this flow ID
function isCircularSubflow(subflows, flowId) {
  const flowDetail = subflows.find(v => v.flowId === flowId);
  return flowDetail != undefined;
}


/**
 * Create an array of subflow items
 **/
function getSubFlows(flow, supportingFlows) {
  var subFlows = [];

  const flowNodes = flow.graphData?.elements?.nodes?.filter(
    (node) =>
      node.data.connectorId == "flowConnector" &&
      (node.data.capabilityName == "startUiSubFlow" ||
        node.data.capabilityName == "startSubFlow")
  );

  if (flowNodes) {
    for (const node of flowNodes) {
      var subFlow = {};
      let subFlowId = "";
      if (node.data.properties.subFlowId) {
        subFlowId = node.data.properties.subFlowId.value.value;
      }
      if (subFlowId) {
        const label = node.data.properties.subFlowId.value.label;

        const subFlowDetail = supportingFlows.find(v => v.flowId === subFlowId);
        // const subFlowDetail = flowInfoMap[subFlowId];

        let name = "";
        if (subFlowDetail) {
          name = subFlowDetail.name;
        }

        subFlow = {
          label: label,
          name: name,
          flowId: subFlowId,
          detail: subFlowDetail
        };
      }
      subFlows.push(subFlow);
    }
  }

  return subFlows;
}


module.exports = DVRule;