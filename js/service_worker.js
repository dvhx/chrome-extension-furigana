// Service worker with shared dictionary and all the logic to keep content scripts simple
// linter: ngspicejs-lint --browser
// global: chrome
"use strict";

console.log("furigana service_worker.js");

var FU = {};
globalThis.FU = FU;

import {replaceAccentedKana} from './accented.js'; // asi netreba, importuje sa v tokenize
import {roumajiToKana} from './roumaji_to_kana.js';
import {dictionary} from './dictionary.js';
import {tokenize, tokenizeAt} from './tokenize.js';
import {render} from './render.js';

FU.dictionary = dictionary;
FU.replaceAccentedKana = replaceAccentedKana;
FU.roumajiToKana = roumajiToKana;
FU.tokenize = tokenize;
FU.tokenizeAt = tokenizeAt;
FU.render = render;

// Execute multiple script files
FU.executeScripts = async function (tabId, scripts) {
    try {
        for (const fn of scripts) {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [fn]
            });
        }
        console.log('executed', tabId, scripts);
    } catch (err) {
        console.error('failed to inject scripts:', err);
    }
};
/*
FU.fetchDictionary = async function () {
    // 100ms
    var t1 = Date.now();
    const response = await fetch(chrome.runtime.getURL('data/dictionary.json'));
    const dictionary = await response.json();
    var t2 = Date.now();
    console.log(t2-t1);
    FU.dictionary = dictionary;
    // console.log(FU.tokenize(FU.dictionary, 'リニアモーターカー車内映像'));
    // console.log(FU.render(FU.tokenize(FU.dictionary, 'リニアモーターカー車内映像'), false));
    return dictionary;
};

FU.fetchDictionary();
*/

function onContextMenuClick(aMenuItem, aTab) {
    // Handle page context menu clicks
    console.log(aMenuItem,aTab);
    FU.tab = aTab;
    if (aMenuItem.menuItemId === 'furigana') {
        // translate selection
        var tokens = FU.tokenize(FU.dictionary, aMenuItem.selectionText);
        // chrome extension has no content script so just show translation in alert
        if (aMenuItem.pageUrl.match(/^chrome/i)) {
            var plain = FU.render(FU.options, tokens, true).trim();
            chrome.scripting.executeScript({
                target: {
                    tabId: aTab.id
                },
                func: (message) => {
                    alert(message);
                },
                args: [
                    plain
                ]
            });
            return;
        }
        // normal pages
        FU.executeScripts(
            aTab.id,
            [
                // insert ruby stylesheet
                "/js/content_style.js",
                // selection handling library
                "/js/selection.js",
                // get selection, send it to background (here), wait for response, replace selection
                "/js/content_active_tab.js"
            ]
        );
    }
}

// create context menus
chrome.contextMenus.create({
    "id": "furigana",
    "title": "Furigana (selection)",
    "contexts": ["selection", "page", "page_action"]
});
chrome.contextMenus.onClicked.addListener(onContextMenuClick);

// Load custom options from local storage
FU.options = {
    mode: 'furigana', // furigana, roumaji, hiragana, furigana_over_kanji
    fontFamily: '',
    fontSize: '',
    furiganaSize: '',
    lineHeight: '',
    colors: false,
    colorsUnknown: true
};
chrome.storage.local.get(['options'], function (o) {
    o.options = o.options || {};
    FU.options.mode = o.options.mode || 'furigana';
    FU.options.fontFamily = o.options.fontFamily || '';
    FU.options.fontSize = o.options.fontSize || '';
    FU.options.furiganaSize = o.options.furiganaSize || '';
    FU.options.lineHeight = o.options.lineHeight || '';
    FU.options.colors = o.options.colors || false;
    FU.options.colorsUnknown = o.options.colorsUnknown || true;
});

// user dictionary
FU.user = {};
chrome.storage.local.get(['user_dict'], function (o) {
    FU.user = o.user_dict;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // receive messages from content script
    //console.log('received:', request, sender);

    // content script is sending nodes for translation
    if (request.type === 'nodes') {
        var response = {
            "type": "replaceSelection",
            "original": [],
            "translation": [],
            "tokens": [],
            "options": FU.options
        };
        // append user dictionary to built-in dictionary
        for (var k in FU.user) {
            FU.dictionary[k] = FU.user[k];
            console.log('merged in', k, FU.user[k]);
        }
        // FIXME: FU.dictionary = FU.user.merge(FU.dictionary, true);
        for (var i in request.data) {
            if (request.data.hasOwnProperty(i)) {
                response.original.push(request.data[i]);
                var tokens = FU.tokenize(FU.dictionary, request.data[i]);
                var html = FU.render(FU.options, tokens, false);
                response.translation.push(html);
                response.tokens.push(tokens);
            }
        }
        sendResponse(response);
        return;
    }

    // Reload user dictionary now (after user modified it in popup or after import in options)
    if (request.type === 'reload_user_dict') {
        chrome.storage.local.get(['user_dict'], function (o) {
            FU.user = o.user_dict;
            console.log(request.type + ' done');
        });
        return;
    }

    // options is asking for current options
    if (request.type === 'get_options') {
        sendResponse(FU.options);
        console.log(request.type + ' done');
        return;
    }

    // options changed something and wants to save it
    if (request.type === 'set_options') {
        FU.options = request.options;
        chrome.storage.local.set({options: FU.options}, function () {
            sendResponse(FU.options);
            console.log(request.type + ' done', request.options);
        });
        return true;
    }

    console.warn('Unsupported request type: ' + request.type);
});


