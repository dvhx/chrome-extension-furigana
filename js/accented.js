// Replace kana with combining character (dakuten, handakuten) to single accented kana character
// linter: ngspicejs-lint --browser
// global:
"use strict";

export function replaceAccentedKana(aText) {
    // replace accented kana with stand alone characters
    if (aText.match('゙') || aText.match('゚')) {
        // 2 dots (dakuten, tenten)
        aText = aText.replace(/ガ/g, 'ガ');
        aText = aText.replace(/ギ/g, 'ギ'); // gi
        aText = aText.replace(/グ/g, 'グ');
        aText = aText.replace(/ゲ/g, 'ゲ');
        aText = aText.replace(/ゴ/g, 'ゴ');
        aText = aText.replace(/ザ/g, 'ザ');
        aText = aText.replace(/ジ/g, 'ジ');
        aText = aText.replace(/ズ/g, 'ズ');
        aText = aText.replace(/ゼ/g, 'ゼ');
        aText = aText.replace(/ゾ/g, 'ゾ');
        aText = aText.replace(/ダ/g, 'ダ');
        aText = aText.replace(/ヂ/g, 'ヂ');
        aText = aText.replace(/ヅ/g, 'ヅ');
        aText = aText.replace(/デ/g, 'デ');
        aText = aText.replace(/ド/g, 'ド');
        aText = aText.replace(/バ/g, 'バ');
        aText = aText.replace(/ビ/g, 'ビ');
        aText = aText.replace(/ブ/g, 'ブ');
        aText = aText.replace(/ベ/g, 'ベ'); // be
        aText = aText.replace(/べ/g, 'ベ'); // be (ヘ != へ)
        aText = aText.replace(/ボ/g, 'ボ');
        aText = aText.replace(/で/g, 'で');
        aText = aText.replace(/ど/g, 'ど');
        aText = aText.replace(/び/g, 'び'); // bi
        aText = aText.replace(/が/g, 'が'); // ga
        aText = aText.replace(/ご/g, 'ご'); // go
        aText = aText.replace(/ぎ/g, 'ぎ'); // gi
        aText = aText.replace(/ぶ/g, 'ぶ'); // bu
        aText = aText.replace(/じ/g, 'じ'); // ji
        aText = aText.replace(/ざ/g, 'ざ'); // za dots
        aText = aText.replace(/だ/g, 'だ'); // da dots
        aText = aText.replace(/ば/g, 'ば'); // ba dots
        aText = aText.replace(/ぢ/g, 'ぢ'); // ji/di dots
        aText = aText.replace(/ず/g, 'ず'); // zu dots
        aText = aText.replace(/づ/g, 'づ'); // dzu dots
        aText = aText.replace(/ゔ/g, 'ゔ'); // vu dots
        aText = aText.replace(/げ/g, 'げ'); // ge dots
        aText = aText.replace(/ぜ/g, 'ぜ'); // ze dots
        aText = aText.replace(/ぞ/g, 'ぞ'); // zo dots
        aText = aText.replace(/ぼ/g, 'ぼ'); // bo dots

        // circle (handakuten, maru)
        aText = aText.replace(/パ/g, 'パ'); // pa
        aText = aText.replace(/ピ/g, 'ピ');
        aText = aText.replace(/ぐ/g, 'ぐ');
        aText = aText.replace(/プ/g, 'プ'); // pu
        aText = aText.replace(/ぺ/g, 'ぺ'); // pe
        aText = aText.replace(/ペ/g, 'ぺ'); // pe, へ (#12408) and ヘ (#12504) are different characters
        aText = aText.replace(/ポ/g, 'ポ'); // po
        aText = aText.replace(/ぷ/g, 'ぷ'); // pu
        aText = aText.replace(/ぱ/g, 'ぱ'); // pa circle
        aText = aText.replace(/ぴ/g, 'ぴ'); // pi circle
        aText = aText.replace(/ぽ/g, 'ぽ'); // po circle
    }
    return aText;
}

if (globalThis.window) {
    globalThis.window.replaceAccentedKana = replaceAccentedKana;
}
