const TestLinter = require("../lib/TestLinter");

const tester = new TestLinter(__dirname, "./ExampleRulePack.js");
tester.runTests();
