#!/usr/bin/env node

/**
 * @fileoverview
 * 从scratch-l10n/locales/blocks-msgs同步语言到msg/scratch_msgs.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const locales = require('scratch-l10n').default;
const blocksMessages = require('scratch-l10n/locales/blocks-msgs');

// Globals
const PATH_OUTPUT = path.resolve(__dirname, '../msg');

let en = fs.readFileSync(path.resolve(__dirname, '../msg/json/en.json'));
en = JSON.parse(en);
const enKeys = Object.keys(en).sort().toString();

// Check that translation is valid:
// entry: array [key, translation]  corresponding to a single string from <locale>.json
// - messages with placeholders have the same number of placeholders
// - messages must not have newlines embedded
const validateEntry = function (entry) {
    const re = /(%\d)/g;
    const [key, translation] = entry;
    const enMatch = en[key].match(re);
    const tMatch = translation.match(re);
    const enCount = enMatch ? enMatch.length : 0;
    const tCount = tMatch ? tMatch.length : 0;
    assert.strictEqual(tCount, enCount, `${key}:${en[key]} - "${translation}" placeholder mismatch`);
    if (enCount > 0) {

      assert.notStrictEqual(tMatch, null, `${key} is missing a placeholder: ${translation}`);
      assert.strictEqual(
          tMatch.sort().toString(),
          enMatch.sort().toString(),
          `${key} is missing or has duplicate placeholders: ${translation}`
      );
    }
    assert.strictEqual(translation.match(/[\n]/), null, `${key} contains a newline character ${translation}`);
};

const validate = function (json, name) {
    assert.strictEqual(Object.keys(json).sort().toString(), enKeys, `${name}: Locale json keys do not match en.json`);
    Object.entries(json).forEach(validateEntry);
};

let file = `// This file was automatically generated.  Do not modify.

'use strict';

goog.provide('Blockly.ScratchMsgs.allLocales');

goog.require('Blockly.ScratchMsgs');

`;

function getLocaleData (locale) {
  return new Promise (function (resolve, reject) {
    resolve({
      locale: locale,
      translations: blocksMessages[locale]
    });
  })
};

Promise.all(Object.keys(locales).map(getLocaleData)).then(function (values) {
  values.forEach(function (translation) {
    validate(translation.translations, translation.locale);
    file += '\n';
    file += `Blockly.ScratchMsgs.locales["${translation.locale}"] =\n`;
    file += JSON.stringify(translation.translations, null, 4);
    file += ';\n';
  });
  file += '// End of combined translations\n';
  // write combined file
  fs.writeFileSync(`${PATH_OUTPUT}/scratch_msgs.js`, file);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
