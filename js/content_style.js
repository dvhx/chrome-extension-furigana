// Content script to insert custom ruby stylesheet only once (chrome.tabs.injectCSS is not working)
// linter: lint-js2
// globals: document, window

console.log("toto je content_style.js");

(function () {
    "use strict";
    var style = document.head.getElementsByClassName("ruby_aodgfpaimckcegdimfcghigjkbnobgdj");
    if (style.length > 0) {
        //console.log("Furigana ruby stylesheet already inserted");
        return;
    }
    style = document.createElement("style");
    style.className = "ruby_aodgfpaimckcegdimfcghigjkbnobgdj";
    style.innerHTML =
            `
div.aodgfpaimckcegdimfcghigjkbnobgdj {
    display: inline;
    font-family: sans-serif;
    font-size: 20px;
    font-weight: normal;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj ruby.even {
    color: green;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj ruby.odd {
    color: blue;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj ruby.unknown {
    color: red;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj ruby:hover {
    background-color: silver;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj rt:hover {
    background-color: silver;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj span.even {
    color: green;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj span.odd {
    color: blue;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj span.unknown {
    color: red;
}

div.aodgfpaimckcegdimfcghigjkbnobgdj span:hover {
    background-color: silver;
}
`;

    document.head.appendChild(style);
    //console.log("Furigana ruby stylesheet just inserted");
}());


