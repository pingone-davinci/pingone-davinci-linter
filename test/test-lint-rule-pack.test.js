const TestLinter = require("../lib/TestLinter");

const tester = new TestLinter(__dirname, "./RulePack.js");
tester.runTests();
