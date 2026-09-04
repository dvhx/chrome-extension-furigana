// Replacing selected text on page (only text elements so that it wont break layout)
// code from http://stackoverflow.com/users/96100/tim-down
// http://stackoverflow.com/questions/7781963/js-get-array-of-all-selected-nodes-in-contenteditable-div
"use strict";

var FU = window.FU || {};

console.log("toto je selection.js");

FU.getOrReplaceSelection = (function () {

    function nextNode(node) {
        // auxiliary function
        if (node.hasChildNodes()) {
            return node.firstChild;
        }
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }

    function getRangeSelectedNodes(range) {
        // auxiliary function
        var node = range.startContainer,
            endNode = range.endContainer,
            rangeNodes = [];

        // Special case for a range that is contained within a single node
        if (node === endNode) {
            return [node];
        }

        // Iterate nodes until we hit the end container
        while (node && node !== endNode) {
            node = nextNode(node);
            rangeNodes.push(node);
        }

        // Add partially selected nodes at the start of the range
        node = range.startContainer;
        while (node && node !== range.commonAncestorContainer) {
            rangeNodes.unshift(node);
            node = node.parentNode;
        }

        return rangeNodes;
    }

    function getSelectedNodes() {
        // get selected nodes
        if (window.getSelection) {
            var sel = window.getSelection();
            if (!sel.isCollapsed) {
                return getRangeSelectedNodes(sel.getRangeAt(0));
            }
        }
        return [];
    }

    function getSelectedTextNodes(aReplaceValues) {
        // return only selected text nodes, optionally replace their values
        var s = getSelectedNodes(),
            t = [],
            div,
            i,
            v,
            b,
            n,
            walk,
            st,
            options = aReplaceValues && aReplaceValues.options;

        // is selection is whole body, convert it to all text nodes
        if ((s.length === 1) && (s[0] === document.body)) {
            s = [];
            walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            n = walk.nextNode();
            while (n) {
                s.push(n);
                n = walk.nextNode();
            }
        }

        // custom RT size
        if (options && options.hasOwnProperty('furiganaSize')) {
            //console.log('furiganaSize', options.furiganaSize);
            if (options.furiganaSize) {
                st = document.getElementById('style_aodgfpaimckcegdimfcghigjkbnobgdj');
                if (!st) {
                    st = document.createElement('style');
                    st.id = 'style_aodgfpaimckcegdimfcghigjkbnobgdj';
                    document.head.appendChild(st);
                }
                st.textContent = 'rt { font-size: ' + options.furiganaSize + '; padding-left: 0.5ex; padding-right: 0.5ex; }';
            }
        }

        for (i = s.length - 1; i >= 0; i--) {
            if (s[i] && s[i].nodeType === 3) {
                t.push(s[i].nodeValue);
                // if aReplaceValues is set, use it to replace values
                if (aReplaceValues) {
                    // skip empty nodes (e.g EOL)
                    if (s[i].nodeValue.trim() !== '') {
                        for (v in aReplaceValues.original) {
                            if (aReplaceValues.original.hasOwnProperty(v)) {
                                if (s[i].nodeValue === aReplaceValues.original[v]) {
                                    // replace original element with new element
                                    b = document.createElement('span');
                                    div = document.createElement('div');
                                    div.className = 'aodgfpaimckcegdimfcghigjkbnobgdj';
                                    div.innerHTML = aReplaceValues.translation[v];
                                    if (options) {
                                        if (options.fontFamily) {
                                            div.style.fontFamily = options.fontFamily;
                                        }
                                        if (options.fontSize) {
                                            div.style.fontSize = options.fontSize;
                                        }
                                        if (options.lineHeight) {
                                            div.style.lineHeight = options.lineHeight;
                                        }
                                    }
                                    b.appendChild(div);
                                    //b.innerHTML = '<div style="font-size: 4px; font-family: monospace;" class="aodgfpaimckcegdimfcghigjkbnobgdj">' + aReplaceValues.translation[v] + '</div>';
                                    //b.style.fontFamily = 'Courier New';
                                    //b.style.fontSize = '60px';
                                    /*
                                    if (!s[i].parentNode) {
                                        console.warn('Parent node unnedefined');
                                        console.warn('s[' + i + ']:', s[i]);
                                    }
                                    */
                                    if (s[i].parentNode) {
                                        try {
                                            s[i].parentNode.insertBefore(b, s[i]);
                                        } catch (e) {
                                            s[i].parentNode.insertAfter(b, s[i]);
                                        }
                                        s[i].parentNode.removeChild(s[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (t.length <= 0) {
            console.warn('empty selection');
        }
        return t;
    }

    return getSelectedTextNodes;

}());

