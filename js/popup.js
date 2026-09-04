// Callbacks for popup page
"use strict";
// globals: replaceAccentedKana

var FU = window.FU || {};
FU.kana = null;
FU.out = null;
FU.single = null;
FU.selection = '';
FU.selectionRoumaji = '';
FU.debug = false; //document.location.hash === '#remember';

FU.onReceive = function (aData) {
    // render received translation
    if (FU.debug) {
        console.log(aData);
    }
    var i;
    FU.out.innerHTML = '';
    for (i = 0; i < aData.translation.length; i++) {
        if (FU.debug) {
            console.info(aData.translation[i]);
        }
        FU.out.innerHTML += '<div>' + aData.translation[i] + '</div>';
    }
};

FU.onFurigana = function () {
    // convert kana to furigana
    if (document.location.hash === '#remember') {
        localStorage.setItem('POPUP_KANA', FU.kana.value);
    }
    chrome.runtime.sendMessage({ "type": "nodes", data: FU.kana.value.trim().split('\n') }, FU.onReceive);
};

FU.onClear = function () {
    // clear kana
    FU.out.innerText = '';
    FU.kana.value = '';
};

FU.onSelect = function () {
    // prepare part of the text for adding
    FU.selection = FU.kana.value.substr(FU.kana.selectionStart, FU.kana.selectionEnd - FU.kana.selectionStart).substr(0, 20);
    document.getElementById('add').disabled = FU.selection === '';
    // also translate it
    chrome.runtime.sendMessage({ "type": "nodes", data: [FU.selection.trim()] }, function (aData) {
        // console.log(aData);
        FU.single.innerHTML = aData.translation[0];
        // extract only roumaji
        var ro = '', i, jre;
        for (i = 0; i < aData.tokens[0].length; i++) {
            jre = aData.tokens[0][i];
            ro += ' ' + (jre[1] || jre[0]);
        }
        FU.selectionRoumaji = (ro + ' ').replace(/[ ]+/g, ' ');
        // console.info(FU.selectionRoumaji);
    });
};

FU.onAdd = function () {
    // add new translation
    FU.user.load();
    var kana = FU.selection,
        roumaji = FU.selectionRoumaji,
        en;
    // empty?
    if (!kana || kana.length <= 0) {
        return;
    }

    // enable this only when adding a lot of names
    /*
    var i, s;
    roumaji = roumaji.replace(/ /g, '');
    roumaji = ' ' + roumaji.charAt(0).toUpperCase() + roumaji.substr(1) + ' ';
    s = ' ';
    for (i = 1; i < roumaji.length; i++) {
        if (roumaji.charAt(i) === '-') {
            s += roumaji.charAt(i - 1);
        } else {
            s += roumaji.charAt(i);
        }
    }
    roumaji = s;
    en = '(name)';
    */

    // replace accented kana
    console.log(kana, typeof kana);
    kana = replaceAccentedKana(kana);
    console.log(kana, typeof kana);

    // roumaji
    roumaji = prompt('Roumaji for ' + kana + '\n(use outer spaces as word boundaries)', roumaji);
    if (!roumaji) {
        return;
    }
    // english
    en = prompt('English', en);
    if (!en) {
        en = roumaji;
    }
    // add data to user defined dictionary
    FU.user.add(kana, roumaji, en);
    // refresh translation
    window.setTimeout(FU.onFurigana, 300);
};

FU.onKeyDown = function () {
    // shortcuts
    // console.log(event);
    var ek = event.key || event.keyIdentifier;
    if (event.ctrlKey && (ek === 'Enter')) {
        FU.onFurigana();
    }
    if (event.altKey && event.keyCode === 65) {
        FU.onAdd();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    // initialize page
    // shorthands
    FU.kana = document.getElementById('kana');
    FU.out = document.getElementById('out');
    FU.single = document.getElementById('single');
    // restore previous kana (only in separated popup)
    if (document.location.hash === '#remember') {
        FU.kana.value = localStorage.hasOwnProperty('POPUP_KANA') ? localStorage.getItem('POPUP_KANA') : '';
        FU.onFurigana();
    }
    // textarea callbacks
    FU.kana.addEventListener('select', FU.onSelect);
    // button callbacks
    document.getElementById('furigana').addEventListener('click', FU.onFurigana);
    document.getElementById('clear').addEventListener('click', FU.onClear);
    document.getElementById('add').addEventListener('click', FU.onAdd);
    // other callbacks
    document.body.addEventListener('keydown', FU.onKeyDown, true);
});
