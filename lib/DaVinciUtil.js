class DaVinciUtil {
  static getFlowVariables(flow) {
    const RESERVED_VARS = ["include-rules", "exclude-rules", "ignore-rules"];

    const varNodes = DaVinciUtil.getNodesByType(flow, /variablesConnector/);

    const flowVariables = [];

    // console.log(varNodes);
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

  static getNodesByType(flow, nodeType) {
    return flow?.enabledGraphData.elements.nodes.filter((node) =>
      node.data?.connectorId?.match(nodeType)
    );
  }

  static getNodesByName(flow, name) {
    return flow?.enabledGraphData.elements.nodes.filter((node) =>
      node.data?.properties?.nodeTitle?.value?.match(name)
    );
  }

  static parseVariableStringValue(varNode) {
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

  static getFlowLinterOptions(flow) {
    const flowLinterNodes = DaVinciUtil.getNodesByName(
      flow,
      /_flow\s*linter_/i
    );
    const flowLinterOptions = {
      // includeRules: [],
      // excludeRules: [],
      // ignoreRules: []
    };
    flowLinterNodes.forEach((n) => {
      const varSet = DaVinciUtil.parseVariableStringValue(n);

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
}

module.exports = DaVinciUtil;
