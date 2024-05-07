const TestLinter = require("../lib/TestLinter");

const tester = new TestLinter(__dirname, "../test/ExampleRulePack.js");
tester.runTests();
