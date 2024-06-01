@pingidentity/dvlint  ![example workflow](https://github.com/pingone-davinci/pingone-davinci-linter/actions/workflows/tests.yml/badge.svg)
=========

This JavaScript module lints PingOne DaVinci flows (as exported from DaVinci) against a known set of
rules and return codes.

More information on the PingOne DaVinci Linter can be found in [Ping Library](https://library.pingidentity.com/page/collection-linter).

## Installation

```bash
npm install -g @pingidentity/dvlint                 --registry https://npm.pinglibrary.com
npm install -g @pingidentity/dvlint-base-rule-pack  --registry https://npm.pinglibrary.com

dvlint -V     # Returns version
dvlint -r     # Prints out rules from default rule pack
```

## Features

- Set of flows to check for errors, best-practices, syntax, security, ... issues with PingOne DaVinci flows.
- `dvlint` CLI tool to run the linter utilities
  - `dvlint -f FLOW` to lint a flow stored in the FLOW file
  - `dvlint -r` to get all the available rules
  - `dvlint -c` to get all the available codes
  - Both JSON and table formats

## Rules List
To get a list of rules for a rule pack(s), run the `dvlint` utility to print a table or JSON object of all rules.
```bash
./dvlint -r    # Prints a table of rules
./dvlint -r -j # Prints a JSON object of rules
```

## Codes List
To get a list of codes for a rule pack(s), run the `dvlint` utility to print a table or JSON object of all codes.
```bash
./dvlint -c    # Prints a table of codes
./dvlint -c -j # Prints a JSON object of codes
```

## Including/Excluding/Ignoring Rules
Rules may be either include or excluded when a flow is run through linter.  Additionally, a rule may be ingnored.  Ignoring a rule will run the rule, providing results from the execution, but ignoring it if it does not pass.

This is accomplished by adding variables into a single DaVinci Variables node at the start of your flow.  The node **MUST** be called `_Flow Linter_`.

* Including Rule(s) - Add a field called `include-rules` into the rule with a value containing rules names.  This should be a csv format if multiple rules are listed.
* Excluding Rule(s) - Add a field called `exclude-rules` into the rule with a value containing rules names.  This should be a csv format if multiple rules are listed.
* Ignoring Rule(s) - Add a field called `ignore-rules` into the rule with a value containing rules names.  This should be a csv format if multiple rules are listed.

Note that an error will be emitted if both include and exclude fields are found.

