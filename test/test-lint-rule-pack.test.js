const TestLinter = require("../lib/TestLinter");

const tester = new TestLinter(__dirname, "./test/RulePack.js");
tester.runTests();
