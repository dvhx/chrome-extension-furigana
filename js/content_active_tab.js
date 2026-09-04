// Content script (send selected text to background, receive translation, render it)
"use strict";

console.log('toto je content_active_tab.js');

var lastResponse;

chrome.runtime.sendMessage({'type': 'nodes', 'data': FU.getOrReplaceSelection()}, function (aResponse) {
    // console.log('aResponse', aResponse);
    FU.getOrReplaceSelection(aResponse);
    lastResponse = aResponse;
});

