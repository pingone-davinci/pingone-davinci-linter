/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require("fs");
const path = require("path");
const PingOneDaVinciLinter = require("./PingOneDaVinciLinter");

class TestLinter {
  constructor(dirname, rulePackPath) {
    this.linter = new PingOneDaVinciLinter({
      directory: dirname,
      rulePacks: [PingOneDaVinciLinter.requireWithRetry(rulePackPath)],
    });
  }

  /**
   * This will run all tests for the rule-pack, consisting of:
   *  - Testing for Rule Definitions
   *  - Testing for Code Definitions
   *  - Testing each rule found in the RulePack
   */
  runTests() {
    describe("DaVinci Linter Testing", () => {
      describe("Rule Definitions", () => {
        test("get rules", () => {
          expect(this.linter.getRules()).toBeDefined();
        });
      });

      describe("Code Definitions", () => {
        test("get codes", () => {
          expect(this.linter.getCodes()).toBeDefined();
        });
      });

      describe("Rule Testing", () => {
        this.runRules();
      });
    });
  }

  runRules() {
    this.linter.rulePacks?.forEach((rulePack) => {
      rulePack.rules?.forEach((rule) => {
        try {
          let ruleTests;

          try {
            ruleTests = fs
              .readdirSync(`${rule.directory}/tests`, { withFileTypes: true })
              .filter((dirent) => dirent.isFile())
              .map((dirent) => `${dirent.path}/${dirent.name}`);
          } catch (err) {
            ruleTests = undefined;
          }

          test(`Test found for rule ${rule.id}`, () => {
            expect(ruleTests).toBeDefined();
          });

          const testJsons = [];

          ruleTests.forEach((t) => {
            if (t.endsWith("expect.json")) {
              const testFilename = t.replace(".expect.json", ".json");
              testJsons.push(testFilename);
            }
          });

          testJsons?.forEach((flow) => {
            const testInput = require(flow);
            const testExpect = require(flow.replace(".json", ".expect.json"));

            test(`Running rule ${rule.id} with ${path.basename(flow)}`, () => {
              expect(
                this.linter.lintFlow(testInput, {
                  includeRules: rule.id,
                })
              ).toMatchObject(testExpect);
            });
          });
        } catch (e) {
          process.stderr.write("Error during runTests(): ", e);
        }
      });
    });
  }
}

module.exports = TestLinter;
