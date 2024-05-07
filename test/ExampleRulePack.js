const LintRulePack = require("pingone-davinci-linter/lib/LintRulePack");
const { version } = require("../package.json");

class PingIdentityBaseDaVinciRulePack extends LintRulePack {
  constructor() {
    super({
      directory: __dirname,
      version,
      name: "example-rule-pack",
      description: "Collection of Example Rules for DaVinci.",
      author: "Ping Identity - cloud-solutions@pingidentity.com",
    });
  }
}

module.exports = PingIdentityBaseDaVinciRulePack;
