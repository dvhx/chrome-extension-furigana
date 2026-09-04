//
// linter: ngspicejs-lint --browser
// global:
"use strict";

export function escapeAttribute(aText) {
    // escape HTML for attribute value
    if (!aText) {
        return aText;
    }
    return aText.toString().replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); //'
};


