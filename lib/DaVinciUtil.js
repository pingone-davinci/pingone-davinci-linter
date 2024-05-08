class DaVinciUtil {
  setFlow(flow) {
    this.flow = flow;
  }

  getFlowVariables() {
    const RESERVED_VARS = ["include-rules", "exclude-rules", "ignore-rules"];

    const varNodes = this.getNodesByType(/variablesConnector/);

    const flowVariables = [];

    varNodes?.forEach((node) => {
      // console.log(node?.data?.properties); //?.saveFlowVariables?.value);
      // varNodes.foreach((node) => {
      node?.data?.properties?.saveFlowVariables?.value?.forEach((flowVar) => {
        // for (const flowVar of node?.data?.properties?.saveFlowVariables?.value) {
        if (!RESERVED_VARS.includes(flowVar.name)) {
          flowVariables.push({
            name: flowVar.name,
            ref: `{{global.flow.variables.${flowVar.name}}}`,
            type: flowVar.type,
            value: flowVar.value,
          });
        }
      });
    });

    return flowVariables;
  }

  getNodesByType(nodeType) {
    return this.flow?.graphData?.elements?.nodes?.filter((node) =>
      node.data?.connectorId?.match(nodeType)
    );
  }

  getFlowNodeTypes() {
    return this.flow?.connectorIds;
  }

  getNodesByName(name) {
    return this.flow?.graphData?.elements?.nodes?.filter((node) =>
      node.data?.properties?.nodeTitle?.value?.match(name)
    );
  }

  getNodeById(nodeId) {
    return this.flow?.graphData?.elements?.nodes?.find(
      (node) => node.data.id === nodeId
    );
  }

  parseVariableStringValue(varNode) {
    const allVars = [];
    varNode?.data?.properties?.saveVariables?.value?.forEach((v) => {
      const vJSON = JSON.parse(v.value);
      const varSet = {
        name: v.name,
        value: vJSON[0].children[0].text,
      };
      allVars.push(varSet);
    });
    return allVars;
  }

  getFlowLinterOptions() {
    const flowLinterNodes = this.getNodesByName(/_flow\s*linter_/i);
    const flowLinterOptions = {
      // includeRules: [],
      // excludeRules: [],
      // ignoreRules: []
    };
    flowLinterNodes?.forEach((n) => {
      const varSet = this.parseVariableStringValue(n);
      varSet.forEach((v) => {
        if (v.name === "include-rules") {
          flowLinterOptions.includeRules = v.value.split(/\s*,\s*/);
        }
        if (v.name === "exclude-rules") {
          flowLinterOptions.excludeRules = v.value.split(/\s*,\s*/);
        }
        if (v.name === "ignore-rules") {
          flowLinterOptions.ignoreRules = v.value.split(/\s*,\s*/);
        }
      });
    });

    if (flowLinterOptions.includeRules && flowLinterOptions.excludeRules) {
      throw new Error(
        "include-rules and exclude-rules cannot both be definded"
      );
    }

    return flowLinterOptions;
  }

  // Create an array of subflows based on the flow argument (the parent flow)
  getSubFlows(flow, supportingFlows) {
    const subFlows = [];

    const flowNodes = flow.graphData?.elements?.nodes?.filter(
      (node) =>
        node.data.connectorId === "flowConnector" &&
        (node.data.capabilityName === "startUiSubFlow" ||
          node.data.capabilityName === "startSubFlow")
    );

    if (flowNodes) {
      flowNodes?.forEach((node) => {
        let subFlow = {};
        let subFlowId = "";
        if (node.data.properties.subFlowId) {
          subFlowId = node.data.properties.subFlowId.value.value;
        }
        if (subFlowId) {
          const { label } = node.data.properties.subFlowId.value;

          const subFlowDetail = supportingFlows.find(
            (v) => v.flowId === subFlowId
          );

          let name = "";
          if (subFlowDetail) {
            name = subFlowDetail.name;
          }

          subFlow = {
            label,
            name,
            flowId: subFlowId,
            detail: subFlowDetail,
          };
        }
        subFlows.push(subFlow);
      });
    }

    return subFlows;
  }

  // Get all subflows in a bundle of exported flows regardless of parent flow
  getAllSubFlows(flows) {
    const subflows = [];

    flows?.forEach((flow) => {
      const flowNodes = flow.graphData?.elements?.nodes?.filter(
        (node) =>
          node.data.connectorId === "flowConnector" &&
          (node.data.capabilityName === "startUiSubFlow" ||
            node.data.capabilityName === "startSubFlow")
      );
      flowNodes?.forEach((node) => {
        if (node.data.properties.subFlowId) {
          subflows.push(node.data.properties.subFlowId.value.value);
        }
      });
    });
    return subflows;
  }
}

module.exports = DaVinciUtil;
