// Convert roumaji to kana
// linter: ngspicejs-lint --browser
// global:
"use strict";

export const roumajiToKana = (function () {
    var self = {},
        skip = {
            ".": 1,
            ",": 1
        },
        dictionary = {
            "x": "x",
            "-": "-",
            " ": " ",
            "'": "'",
            ":": ":",
            "a": "あ",
            "'i": "'い",
            "i": "い",
            "u": "う",
            "e": "え",
            "o": "お",
            "ka": "か",
            "ki": "き",
            "ku": "く",
            "ke": "け",
            "ko": "こ",
            "kya": "きゃ",
            "kyu": "きゅ",
            "kyo": "きょ",
            "sa": "さ",
            "shi": "し",
            "su": "す",
            "se": "せ",
            "so": "そ",
            "sha": "しゃ",
            "shu": "しゅ",
            "sho": "しょ",
            "ta": "た",
            "chi": "ち",
            "tsu": "つ",
            "te": "て",
            "to": "と",
            "cha": "ちゃ",
            "chu": "ちゅ",
            "cho": "ちょ",
            "na": "な",
            "ni": "に",
            "nu": "ぬ",
            "ne": "ね",
            "no": "の",
            "nya": "にゃ",
            "nyu": "にゅ",
            "nyo": "にょ",
            "ha": "は", // wa as particle
            "hi": "ひ",
            "fu": "ふ",
            "he": "へ", // e as particle
            "ho": "ほ",
            "hya": "ひゃ",
            "hyu": "ひゅ",
            "hyo": "ひょ",
            "ma": "ま",
            "mi": "み",
            "mu": "む",
            "me": "め",
            "mo": "も",
            "mya": "みゃ",
            "myu": "みゅ",
            "myo": "みょ",
            "ya": "や",
            "yu": "ゆ",
            "yo": "よ",
            "ra": "ら",
            "ri": "り",
            "ru": "る",
            "re": "れ",
            "ro": "ろ",
            "rya": "りゃ",
            "ryu": "りゅ",
            "ryo": "りょ",
            "wa": "わ",
            "wi": "ゐ",
            "we": "ゑ",
            "wo": "を",
            "n": "ん",
            "m": "ん",
            "ga": "が",
            "gi": "ぎ",
            "gu": "ぐ",
            "ge": "げ",
            "go": "ご",
            "gya": "ぎゃ",
            "gyu": "ぎゅ",
            "gyo": "ぎょ",
            "za": "ざ",
            "ji": "じ",
            "dji": "ぢ",
            "zu": "ず",
            "ze": "ぜ",
            "zo": "ぞ",
            //"ja": "じゃ",
            //"ju": "じゅ",
            //"jo": "じょ",
            "da": "だ",
            "dzu": "づ",
            //"zu": "づ",
            "de": "で",
            "do": "ど",
            "ja": "ぢゃ",
            "ju": "ぢゅ",
            "jo": "ぢょ",
            "ba": "ば",
            "bi": "び",
            "bu": "ぶ",
            "be": "べ",
            "bo": "ぼ",
            "bya": "びゃ",
            "byu": "びゅ",
            "byo": "びょ",
            "pa": "ぱ",
            "pi": "ぴ",
            "pu": "ぷ",
            "pe": "ぺ",
            "po": "ぽ",
            "pya": "ぴゃ",
            "pyu": "ぴゅ",
            "pyo": "ぴょ",
            "ye": "え",
            "v": "ヴ", // u?
            "vi": "ヴィ",
            "fa": "ファ",
            // duplication
            "bbya": "っびゃ",
            "bbyu": "っびゅ",
            "bbyo": "っびょ",
            "tta": "った",
            "ttsu": "っつ",
            "tte": "って",
            //"tto": "っと",
            "tto": "ット",
            "ssha": "っしゃ",
            "sshi": "っし",
            "sshu": "っしゅ",
            "ssho": "っしょ",
            "ssa": "っさ",
            "ssu": "っす",
            "sse": "っせ",
            "sso": "っそ",
            "ppa": "っぱ",
            "ppi": "っぴ",
            "ppu": "っぷ",
            "ppe": "っぺ",
            "ppo": "っぽ",
            "ppya": "っぴゃ",
            "ppyu": "っぴゅ",
            "ppyo": "っぴょ",
            "kka": "っか",
            "kki": "っき",
            "kku": "っく",
            "kke": "っけ",
            "kko": "っこ",
            "kkya": "っきゃ",
            "kkyu": "っきゅ",
            "kkyo": "っきょ",
            "ccha": "っちゃ",
            "cchi": "っち",
            "cchu": "っちゅ",
            "ccho": "っちょ",
            "ffe": "ッフ",
            "fii": "フィー",
            "je": "ジェ"
        };
    var DictionaryWidth = Object.keys(dictionary).reduce((max, key) => {return Math.max(max, key.length);}, 0);
    //console.warn('rtk dictionary width', DictionaryWidth);

    self.tokenizeAt = function (aText, aPosition, aMaxKeyLength) {
        // in aText from aPosition find next word, return [word, roumaji, en] or null
        // find longest words first
        var i, word;
        for (i = aMaxKeyLength + 1; i >= 1; i--) {
            word = aText.substring(aPosition, aPosition + i);
            if (word && dictionary[word]) {
                return [word, dictionary[word]];
            }
        }
        return null;
    };

    self.missing = {};

    self.tokenize = function (aText) {
        // tokenize roumaji text
        if (!aText) {
            return [];
        }
        aText = aText.toLowerCase().trim();
        if (skip[aText]) {
            return [];
        }
        var a = [],
            i,
            word;
        // replace accented kana
        //aText = FuriganaBrowser.replaceAccentedKana(aText);

        // go by characters
        for (i = 0; i < aText.length; i++) {
            // find longest word at this position
            word = self.tokenizeAt(aText, i, DictionaryWidth);
            if (!word) {
                console.error('missing roumajiToKana word at ', aText.substr(i, 6) + '... in ', aText);
            }
            if (word) {
                // known word
                i += word[0].length - 1;
                a.push(word);
            } else {
                // unknown word (return character as is)
                self.missing[aText] = 'text=' + aText + ' i=' + i;
                a.push([aText.charAt(i), null]);
            }
        }

        return a;
    };

    self.render = function (aTokens) {
        // Render tokens as string
        if (typeof aTokens === 'string') {
            aTokens = self.tokenize(aTokens);
        }
        var s = [];
        aTokens.map(function (a) {
            s.push(a[1] || a[0]);
        });
        return s.join('');
    };

    self.isPunctuation = function (aText) {
        // Return true if text is entirely punctuation
        return aText.match(/^[「」\[\]～]+$/) !== null;
    };

    self.isKatakana = function (aText) {
        // Return true if text is entirely katakana
        return aText.match(/^[ッヽ゛゜ィブヴーデドダアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン]+$/) !== null;
    };

    self.isHiragana = function (aText) {
        // Return true if text is entirely hiragana
        return aText.match(/^[っゝ゛゜ーあいうえおかきくけこがぎぐげごさしすせそざじずぜぞたちつてとだぢづでどなにぬねのはひふへほばびぶべぼぱぴぷぺぽまみむめもやゆよらりるれろわゐゑをん]+$/) !== null;
    };

    self.short = function (aOriginal, aRender) {
        // Ommit ending kana if it was in original
        if (self.isKatakana(aOriginal) || self.isHiragana(aOriginal)) {
            return '---';
        }
        //return aRender;
        var i,
            a = aOriginal.split(''),
            j = a.length - 1,
            b = aRender.split('');
        //console.log('a', a.join(','), 'b', b.join(','));
        for (i = b.length - 1; i >= 0; i--) {
            //console.log(i, b[i], j, a[j]);
            if (b[i] !== a[j]) {
                break;
            }
            b[i] = '　'; //'\xa0';
            j--;
        }
        //console.log('ret', b);
        return b.join('');
    };

    //self.short('起こる', 'おこる');

    return self;
}());

