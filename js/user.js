// User-defined dictionary, saved to local storage
// linter: ngspicejs-lint --browser
// global: chrome, SC
"use strict";

var FU = window.FU || {};

FU.user = {};
FU.user.data = {};

FU.user.load = function (aCallback) {
    // load user dictionary from local storage
    chrome.storage.local.get(['user_dict'], function (o) {
        FU.user.data = o.user_dict || {};
        if (aCallback) { aCallback(); }
    });
};
FU.user.load();

FU.user.save = function () {
    // save user dictionary to localStorage
    chrome.storage.local.set({user_dict: FU.user.data});
    chrome.runtime.sendMessage({type: 'reload_user_dict'});
};

FU.user.add = function (aKana, aRoumaji, aEnglish) {
    // add new phrase to user-defined dictionary
    // ask if overwrite previous data
    if (FU.user.data.hasOwnProperty(aKana)) {
        var a, b;
        a = FU.user.data[aKana][0] + ' (' + FU.user.data[aKana][1] + ')';
        b = aRoumaji + ' (' + aEnglish + ')';
        if (a !== b) {
            if (!confirm('Do you want to replace:\n\n' + a + '\n\nwith:\n\n' + b)) {
                return;
            }
        }
    }
    // add
    FU.user.data[aKana] = [aRoumaji, aEnglish];
    console.log(FU.user.data);
    // save
    FU.user.save();
};

FU.user.merge = function (aBuiltIn, aFreshUpdate) {
    // merge user dictionary into built-in dictionary
    if (aFreshUpdate) {
        FU.user.load();
    }
    var key;
    for (key in FU.user.data) {
        if (FU.user.data.hasOwnProperty(key)) {
            aBuiltIn[key] = FU.user.data[key];
        }
    }
    return aBuiltIn;
};

FU.user.erase = function () {
    // erase user dictionary
    if (confirm('Are you sure you want to erase ' + Object.keys(FU.user.data).length + ' phrases from your user dictionary, they will be permanently lost!')) {
        FU.user.data = {};
        FU.user.save();
    }
};

FU.user.cleanup = function (aBuiltIn, aFreshUpdate) {
    // cleanup user dictionary from words that are already in main dictionary
    if (aFreshUpdate) {
        FU.user.load();
    }
    var key, known = [], unknown = [], n = {}, i;
    for (key in FU.user.data) {
        if (FU.user.data.hasOwnProperty(key)) {
            if (aBuiltIn.hasOwnProperty(key)) {
                // will be removed
                known.push(key);
            } else {
                // will be kept
                unknown.push(key);
            }
        }
    }
    console.info(known.length + ' phrases will be deleted:');
    console.info(known);
    console.info(unknown.length + ' phrases will be kept:');
    console.info(unknown);
    if (known.length <= 0) {
        alert('There are no duplicates in your dictionary to be removed!');
        return;
    }
    if (confirm(known.length + ' phrases are already in main dictionary and will be removed. ' +
            unknown.length + ' phrases are not in main dictionary and will be kept in your dictionary. ' +
            'See console for details (Ctrl+Shift+i).\n\n' +
            'Are you sure you want to continue?')) {
        // actually remove them
        for (i = 0; i <= unknown.length; i++) {
            n[unknown[i]] = FU.user.data[unknown[i]];
        }
        console.log(n);
        FU.user.data = n;
        FU.user.save();
    }
};

FU.user.export = function (event) {
    // export user dictionary
    FU.user.load();
    var a = document.createElement('a'), filename, filedata, filesize;
    filename = 'furigana-user-dict-' + (new Date()).toISOString().split('T')[0] + '.json';
    if (event && (event.ctrlKey || event.shiftKey)) {
        filedata = JSON.stringify(FU.user.data).replace(/\"\],/g, '"],\n'); // '
    } else {
        filedata = JSON.stringify(FU.user.data, undefined, 4);
    }
    filesize = filedata.length;
    if (filesize < 500000) {
        // too much data (~2MB) will crash the chrome
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(filedata));
        a.setAttribute('download', filename);
        a.click();
        document.getElementById('import_export_info').innerText = 'Exported ' + Object.keys(FU.user.data).length + ' words (' + (filesize / 1000).toFixed(0) + ' kB) to ' + filename;
    } else {
        // save it yourself (Ctrl+S)
        document.body.innerText = filedata;
    }
};

FU.user.import = function () {
    // import user dictionary
    SC.chooseFiles(function (aFiles) {
        try {
            var j = JSON.parse(aFiles[0].data);
            FU.user.data = j;
            FU.user.save();
            document.getElementById('import_export_info').innerText = 'Imported ' + Object.keys(j).length + ' words';
            chrome.runtime.sendMessage({type: 'reload_user_dict'});
        } catch (e) {
            console.error(e, aFiles);
            document.getElementById('import_export_info').innerText = 'Import failed, invalid or incomplete data!\n' + e.message ? e.message : '';
        }
    }, '.json', true);
};

