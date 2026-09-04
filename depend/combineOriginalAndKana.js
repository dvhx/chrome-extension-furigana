// This file was provided by https://github.com/tmilar/furigana-helper

/**
 * Util method to detect if string is kanji only
 *
 * @param char {string}
 * @return {boolean}
 * @private
 */
export function isKanji(char) {
  // all kanji in the basic unicode plane
  // regex source: https://github.com/Pomax/node-jp-conversion/blob/master/index.js#L453
  const kanjiRange = /[\u3300-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/;
  return kanjiRange.test(char);
}

/**
 * Combine any JP string input with it's corresponding -kana transcription, to groups of original-kana pairs
 * useful for kanji-only furigana readability.
 *
 * @param aOriginal {string} - original JP string comprised of kanji / hiragana / katakana symbols
 * @param aKana {string} - corresponding JP string in hiragana / katakana symbols only
 * @return combinedGroups [] - array of string pairs of original-to-kana combinations.
 */
export function combineOriginalAndKana(aOriginal, aKana) {

   // following special cases are causing issues
   var specialCases = {
	    "五つ":[["五","いつ"],["つ","つ"]],
	    "今まて":[["今","いま"],["まて","まて"]],
	    "今まで":[["今","いま"],["まで","まで"]],
	    "加わる":[["加","くわ"],["わる","わる"]],
	    "幸い":[["幸","さいわ"],["い","い"]],
	    "幼なじみ":[["幼","おさな"],["なじみ","なじみ"]],
	    "忽ち":[["忽","たちま"],["ち","ち"]],
	    "私たち":[["私","わたし"],["たち","たち"]],
	    "翻る":[["翻","ひるがえ"],["る","る"]],
	    "荒らげる":[["荒","あら"],["らげる","らげる"]]
	};
  if (specialCases.hasOwnProperty(aOriginal)) {
    return specialCases[aOriginal];
  }

  let i = 0;
  let j = 0;
  const originalLen = aOriginal.length;
  const kanaLen = aKana.length;
  const combinedGroups = [];

  // while: not finished orig AND next kanas available, OR next kana is tbe last one and not any result yet.
  while (
    (i < originalLen && j + 1 < kanaLen) ||
    (j + 1 === kanaLen && combinedGroups.length === 0)
  ) {
    // start a new group
    let originals = "";
    let kanas = "";

    if (isKanji(aOriginal[i])) {
      originals += aOriginal[i];
      kanas += aKana[j];

      // grab next kanas, until the next kana matches the next orig char (or no more kana left)
      while (j + 1 < kanaLen && aOriginal[i + 1] !== aKana[j + 1]) {
        kanas += aKana[j + 1];
        j++;
      }

      // grab next contiguous kanjis
      while (i + 1 < originalLen && isKanji(aOriginal[i + 1])) {
        originals += aOriginal[i + 1];
        i++;
      }

      // now, next chars are not kanji, and both equal => advance indexes and start a new group.
      i++;
      j++;
    } else {
      // current orig is not kanji
      // grab origs & kanas, until a kanji appears (or no more next chars)
      while (j < kanaLen && !isKanji(aOriginal[i])) {
        originals += aOriginal[i];
        kanas += aOriginal[i];

        i++; // advance originals index
        j++; // advance kanas index
      }
    }

    combinedGroups.push([originals.trim(), kanas.trim()]);
  }

  return combinedGroups;
}
