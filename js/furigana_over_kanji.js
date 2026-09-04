// 4th rendering mode
// linter: ngspicejs-lint --browser
// global:
"use strict";

import {isKanji, combineOriginalAndKana} from '../depend/combineOriginalAndKana.js';
import {roumajiToKana} from './roumaji_to_kana.js';
import {escapeAttribute} from './escape_attribute.js';

export function furiganaOverKanji(aOriginal, aRoumaji, aEnglish, aEvenOddClass) {
    // Create ruby code with furigana only over kanji
    if (!isKanji(aOriginal)) {
        return '<span ' + aEvenOddClass + ' title="' + (escapeAttribute(aEnglish) || aRoumaji || '?') + '">' + aOriginal + '</span>';
    }
    aRoumaji = aRoumaji.replace(/[ \(\)]+/g, '');
    var hiragana = roumajiToKana.render(roumajiToKana.tokenize(aRoumaji)),
        combined = combineOriginalAndKana(aOriginal, hiragana),
        i,
        rt,
        html = [];
    //console.log(aOriginal, aRoumaji, hiragana, combined);
    // single span with even/odd class and title, multiple ruby
    html.push('<span ' + aEvenOddClass + ' title="' + (escapeAttribute(aEnglish) || aRoumaji || '?') + '">');
    for (i = 0; i < combined.length; i++) {
        rt = combined[i][0] === combined[i][1] ? '' : combined[i][1];
        html.push('<ruby>' + combined[i][0] + '<rt>' + rt + '</rt></ruby>');
        if (rt.match(/[a-zA-Z]/)) {
            //FU.bugs3[combined[i][0]] = rt;
            console.log('furiganaOverKanji bug', combined[i][0], rt);
        }
    }
    html.push('</span>');
    /*
    // multiple ruby, each with even/odd class and title
    // html.push('<ruby' + even_odd + ' title="' + (escapeAttribute(aEnglish) || '?') + '">' + aOriginal + '<rt>' + aRoumaji + '</rt></ruby>';
    for (i = 0; i < combined.length; i++) {
        rt = combined[i][0] === combined[i][1] ? '' : combined[i][1];
        html.push('<ruby' + aEvenOddClass + ' title="' + (escapeAttribute(aEnglish) || '?') + '">' + combined[i][0] + '<rt>' + rt + '</rt></ruby>');
    }
    */
    return html.join('');
}


