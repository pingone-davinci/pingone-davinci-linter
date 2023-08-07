
class DaVinciUtil {

  static getFlowVariables(flow) {
    const RESERVED_VARS = ['include-rules', 'exclude-rules', 'ignore-rules'];

    const varNodes = DaVinciUtil.getNodes(flow, "variablesConnector")

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
            value: flowVar.value
          });
        }
      });
    });

    return flowVariables;
  }

  static getNodes(flow, nodeType) {
    return flow?.enabledGraphData.elements.nodes.filter(
      (node) => node.data.connectorId === nodeType
    );
  }

  static getNodesByName(flow, name) {
    return flow?.enabledGraphData.elements.nodes.filter(
      (node) => node.data?.properties?.nodeTitle?.value === name
    );
  }

  static parseVariableStringValue(varNode) {
    const allVars = [];
    varNode?.data?.properties?.saveFlowVariables?.value?.forEach((v) => {
      console.log(v.value)
      const vJSON = JSON.parse(v.value)
      console.log(vJSON)
      console.log(vJSON[0].children[0].text)
      const varSet = {
        name: v.name,
        value: vJSON[0].children[0].text
      }
      allVars.push(varSet);
    });
    return allVars;
  }

  static getFlowLinterOptions(flow) {
    const flowLinterNodes = DaVinciUtil.getNodesByName(flow, "_Flow Linter_");

    const flowLinterOptions = {
      // includeRules: [],
      // excludeRules: [],
      // ignoreRules: []
    }
    flowLinterNodes.forEach((n) => {
      const varSet = DaVinciUtil.parseVariableStringValue(n);

      console.log(varSet);

      varSet.forEach((v) => {
        if (v.name === "include-rules") {
          flowLinterOptions.includeRules = v.value.split(",");
        }
        if (v.name === "exclude-rules") {
          flowLinterOptions.excludeRules = v.value.split(",");
        }
        if (v.name === "ignore-rules") {
          flowLinterOptions.ignoreRules = v.value.split(",");
        }
      });
    });


    if (flowLinterOptions.includeRules && flowLinterOptions.excludeRules) {
      throw new Error("include-rules and exclude-rules cannot both be definded")
    }

    return flowLinterOptions
  }

}

module.exports = DaVinciUtil;