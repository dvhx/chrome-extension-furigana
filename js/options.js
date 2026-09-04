// Callbacks for options page
// linter: ngspicejs-lint --browser
// global: chrome, SC
"use strict";

var FU = window.FU || {};

FU.options = {};

FU.loadOptions = function (aCallback) {
    // Get options from service worker and fill inputs
    chrome.runtime.sendMessage({type:"get_options"}, function (aResponse) {
        FU.options = aResponse;
        console.log('options', FU.options);
        // mode
        FU.e['mode_' + FU.options.mode].checked = true;
        // font
        FU.e.custom_font_family.value = FU.options.fontFamily;
        FU.e.custom_font_size.value = FU.options.fontSize;
        FU.e.custom_furigana_size.value = FU.options.furiganaSize;
        FU.e.custom_line_height.value = FU.options.lineHeight;
        // colors
        FU.e.colors.checked = FU.options.colors;
        FU.e.colors_unknown.checked = FU.options.colorsUnknown;
        aCallback();
    });
};

FU.saveOptions = function () {
    // Send modified options to service_worker.js for saving to chrome.storage.local
    FU.options.mode = Array.from(document.getElementsByName('mode')).find((e) => e.checked).value;
    FU.options.fontFamily = FU.e.custom_font_family.value;
    FU.options.fontSize = FU.e.custom_font_size.value;

    // validate furigana size (because it goes into <style>)
    var furigana_size = FU.e.custom_furigana_size.value;
    try {
        furigana_size = furigana_size.match(/(medium|xx-small|x-small|small|large|x-large|xx-large|smaller|larger|[0-9\.]+(px|pt|%|in|cm|mm|em|ex|pc))/)[0];
        // prevent large values
        if (furigana_size.match(/(em|ex|cm)/) && parseInt(furigana_size, 10) > 20) {
            furigana_size = '';
        }
        if (furigana_size.match(/(pc|px|mm)/) && parseInt(furigana_size, 10) > 100) {
            furigana_size = '';
        }
        if (furigana_size.match('%') && parseInt(furigana_size, 10) > 300) {
            furigana_size = '';
        }
    } catch (e) {
        furigana_size = '';
        //console.warn('invalid size', e);
    }
    FU.options.furiganaSize = furigana_size;

    FU.options.lineHeight = FU.e.custom_line_height.value;
    FU.options.colors = FU.e.colors.checked;
    FU.options.colorsUnknown = FU.e.colors_unknown.checked;
    chrome.runtime.sendMessage({type:"set_options", options: FU.options}, function () {
        FU.updateSampleText();
    });
};

FU.originalSampleText = '';

FU.updateSampleText = function () {
    FU.originalSampleText = FU.originalSampleText || FU.e.sample_text.textContent;
    chrome.runtime.sendMessage({type:'nodes', data: [FU.originalSampleText]}, function (aResponse) {
        console.log(aResponse);
        FU.e.sample_text.innerHTML = aResponse.translation[0];
        // font size etc...
        var
            family = FU.e.custom_font_family.value,
            size = FU.e.custom_font_size.value,
            furigana_size = FU.e.custom_furigana_size.value,
            lineHeight = FU.e.custom_line_height.value,
            st = FU.e.furigana_size_style;
        FU.e.sample_text.style.fontFamily = family || '';
        FU.e.sample_text.style.fontSize = size || '';
        FU.e.sample_text.style.lineHeight = lineHeight || '';
        // RT
        st = document.getElementById('furigana_size_style');
        if (furigana_size) {
            st.textContent = 'rt { font-size: ' + furigana_size + '; }';
        } else {
            st.textContent = '';
        }
    });
};

FU.onFileAccessEnable = function () {
    // let user allow file access
    chrome.extension.isAllowedFileSchemeAccess(function (aAllowed) {
        if (aAllowed) {
            alert('Furigana is already enabled in downloaded pages, so it should probably work.');
        } else {
            alert('New tab with extension settings will be opened where you must manually allow "Allow access to file URLs" for Furigana chrome extension. After that you should be able to use Furigana in downloaded pages.');
            chrome.tabs.create({
                url: 'chrome://extensions/?id=' + chrome.runtime.id
            });
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    // initialize window
    FU.e = SC.elementsWithId();
    FU.loadOptions(FU.saveOptions);
    // callbacks
    FU.e.export.addEventListener('click', FU.user.export);
    FU.e.import.addEventListener('click', FU.user.import);
    // mode
    FU.e.mode.addEventListener('change', FU.saveOptions);
    // custom font
    FU.e.custom_font_family.addEventListener('change', FU.saveOptions);
    FU.e.custom_font_family.addEventListener('keyup', FU.saveOptions);
    FU.e.custom_font_size.addEventListener('change', FU.saveOptions);
    FU.e.custom_font_size.addEventListener('keyup', FU.saveOptions);
    FU.e.custom_furigana_size.addEventListener('change', FU.saveOptions);
    FU.e.custom_furigana_size.addEventListener('keyup', FU.saveOptions);
    FU.e.custom_line_height.addEventListener('change', FU.saveOptions);
    FU.e.custom_line_height.addEventListener('keyup', FU.saveOptions);
    // colors
    FU.e.colors.addEventListener('click', FU.saveOptions);
    FU.e.colors_unknown.addEventListener('click', FU.saveOptions);
    // file access
    FU.e.file_access_enable.addEventListener('click', FU.onFileAccessEnable);
});

