// HTML ruby renderer
// linter: ngspicejs-lint --browser
// global: chrome
"use strict";

var FU = FU || {};

import {roumajiToKana} from './roumaji_to_kana.js';
import {escapeAttribute} from './escape_attribute.js';
import {furiganaOverKanji} from './furigana_over_kanji.js';

FU.isKanji = function(char) {
  // all kanji in the basic unicode plane
  // regex source: https://github.com/Pomax/node-jp-conversion/blob/master/index.js#L453
  const kanjiRange = /[\u3300-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
  return kanjiRange.test(char);
};

FU.cleanupRoumaji = function (s) {
    // remove duplicate spaces, make first capital, add dot at the end
    s = s.trim();
    s = s.replace(/[ ]+/g, ' ');
    s = s.charAt(0).toUpperCase() + s.substr(1);
    s = s.trim();
    s = s.replace(/ \, /g, ', ');
    s = s.replace(/ \,/g, ',');
    s = s.replace(/ \./g, '.');
    s = s.replace(/ \!/g, '!');
    s = s.replace(/ \?/g, '?');
    s = s.replace(/ \)/g, ')');
    s = s.replace(/\( /g, '(');
    s = s.replace(/„ /g, '„');
    s = s.replace(/ “ /g, '“ ');
    return s;
};

FU.rubyClass = function (aColors) {
    // make even/odd rubies different color
    FU.ruby_odd++;
    if (!aColors) {
        return '';
    }
    return (FU.ruby_odd % 2 === 1) ? ' class="odd"' : ' class="even"';
};

export function render(aOptions, aTranslation, aPlainText) {
    // return HTML with rubies
    var html = '',
        furi = '',
        roma = '',
        plain = '',
        s,
        i,
        even_odd,
        c;
    FU.ruby_odd = 0;

    for (i = 0; i < aTranslation.length; i++) {
        c = aTranslation[i];

        if (!c[1]) {
            // unknown character
            if (aOptions.colorsUnknown && (c[0] > '\xFF')) {
                furi += '<ruby class="unknown">' + c[0] + '</ruby>';
                roma += '<span class="unknown">' + c[0] + '</span>';
                plain += c[0];
            } else {
                furi += c[0];
                roma += c[0];
                plain += c[0];
            }
        } else if (['.', '!', '?', ','].indexOf(c[1].trim()) >= 0) {
            // do not show furigana for certain diacritics
            furi += c[0];
            roma += c[1];
            plain += c[1];
        } else {
            // ruby
            even_odd = FU.rubyClass(aOptions.colors);
            if (aOptions.mode === 'furigana_over_kanji') {
                furi += furiganaOverKanji(c[0], c[1], c[2], even_odd);
            } else {
                furi += '<ruby' + even_odd + ' title="' + (escapeAttribute(c[2]) || '?') + '">' + c[0] + '<rt>' + c[1] + '</rt></ruby>';
            }
            s = c[1];
            if (aOptions.mode === 'hiragana') {
                if (FU.isKanji(c[0])) {
                    s = roumajiToKana.render(roumajiToKana.tokenize(s));
                } else {
                    s = c[0];
                }
            }
            roma += '<span' + even_odd + ' title="' + (escapeAttribute(c[2]) || '?') + '">' + s + '</span>';
            plain += c[1];
        }
        if ((c[0] === '\n') || (i === aTranslation.length - 1)) {
            if (aOptions.mode === 'furigana' || aOptions.mode === 'furigana_over_kanji') {
                html += furi + ' ';
            }
            if (aOptions.mode === 'roumaji') {
                // roma = FU.cleanupRoumaji(roma); // this only works for plaintext
                html += roma + ' ';
            }
            if (aOptions.mode === 'hiragana') {
                //console.warn(roma);
                //html += roumajiToKana.render(roumajiToKana.tokenize(roma)) + ' ';
                html += roma + ' ';
            }
            furi = '';
            roma = '';
        }
    }
    if (aPlainText) {
        console.log('vraciam', plain);
        return FU.cleanupRoumaji(plain);
    }
    return html;
}


