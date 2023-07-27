const LintRule = require("../../LintRule.js")

class DVRule extends LintRule {

  constructor() {
    super("dv-rule-conn-001", "Checks for connection name mismatches");
  }

  runRule(props) {
    const dvSummary = props.dvSummary;
    const dvFlow = props.dvFlow;
    const flowId = props.flowId;

    if (!dvSummary) return;

    // This rule is fairly simple and will just use the summary file, and not dig through the raw flow JSON
    const flowDetail = dvSummary.flowsDetail.find(v => v.flowInfo.flowId === flowId);
    // Get the connections for the target flow ID
    let connections = flowDetail.connections;
    // Get the map of all the connections dumped at the company ID level
    const connectionMap = dvSummary.connectionMap;
    let uniqConnections = {};
    let connectionsFound = [];

    // Build unique list of connections for the flow
    for (const conn of connections) {
      if (uniqConnections[conn.name]) {
        uniqConnections[conn.name].count++;
      } else {
        uniqConnections[conn.name] = {
          name: conn.name,
          connectionId: conn.connectionId,
          count: 1
        }
      }
      if (connectionsFound.indexOf(conn.name) === -1) {
        connectionsFound.push(conn.name);
      }
    }

    // Compare to the connector details looking for name mismatch
    for (const key in uniqConnections) {
      const conn = uniqConnections[key];
      const connMapName = connectionMap[conn.connectionId].name
      if (conn.name != connMapName) {
        this.addError("dv-er-node-003", [conn.name, connMapName]);
      }
    }
  }
}

module.exports = DVRule;