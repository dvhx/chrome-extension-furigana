// Split japanese sentence into words using dictionary of words/phrases
// linter: ngspicejs-lint --browser
// global:
"use strict";

import { replaceAccentedKana } from './accented.js';

var DictionaryWidth = 0;

export function tokenizeAt(aDictionary, aText, aPosition, aMaxKeyLength) {
    // in aText from aPosition find next word, return [word, roumaji, en] or null
    // find longest words first
    var i, word;
    for (i = aMaxKeyLength + 1; i >= 1; i--) {
        word = aText.substring(aPosition, aPosition + i);
        if (word && aDictionary[word]) {
            return [word, aDictionary[word][0], aDictionary[word][1]];
        }
    }
    return null;
}

export function tokenize(aDictionary, aText) {
    // tokenize whole text
    var a = [],
        i,
        word;

    // calculate max key length if necessary
    if (DictionaryWidth <= 0) {
        var t1=Date.now();
        DictionaryWidth = Object.keys(aDictionary).reduce((max, key) => {return Math.max(max, key.length);}, 0);
        var t2=Date.now();
        console.log('dw', DictionaryWidth, t2-t1);
        //FU.dictionaryCurrentWidth = FU.dictionaryWidth(FU.dictionary);
        //console.log('FU.dictionaryCurrentWidth=' + FU.dictionaryCurrentWidth);
    }

    // replace accented kana
    aText = replaceAccentedKana(aText);

    // go by characters
    for (i = 0; i < aText.length; i++) {
        // find longest word at this position
        word = tokenizeAt(aDictionary, aText, i, DictionaryWidth);
        if (word) {
            // known word
            i += word[0].length - 1;
            a.push(word);
        } else {
            // unknown word (return character as is)
            a.push([aText.charAt(i), null, null]);
        }
    }

    return a;
}

