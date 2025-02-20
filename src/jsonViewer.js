import {EditorView, basicSetup} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"
import {EditorState, RangeSetBuilder} from "@codemirror/state"
import {search} from "@codemirror/search";
import * as prettier from "prettier";
import * as parserBabel from "prettier/parser-babel";
//import * as parserBabel from "prettier/plugins/babel.js";
import * as prettierPluginEstree from "prettier/plugins/estree";
import {setupLinkDecorator} from './linkDecorator.js'
import {setupCopyToClipboardPlugin} from './copyButtonPlugin.js'
import './jsonViewer.css'


export function setupJsonViewer(element, height, text) {
  const customSearchConfig = search({
    top: true // Moves the search panel to the top
  });

  let startState = EditorState.create({
    doc: text,
    extensions: [
      basicSetup,
      customSearchConfig,
      setupLinkDecorator(RangeSetBuilder),
      setupCopyToClipboardPlugin(),
      EditorState.readOnly.of(true), // state  level readonly
      EditorView.editable.of(true), // but stil focusable in DOM level (this is the default but left here for clarity)
      EditorView.theme({
        "&": {                    // this selects .cm-editor
          height: height + "px",  // set the height
          overflow: "auto",       // add scrollbars when content exceeds the height
        },
      }),
      javascript()],
  })

  let view = new EditorView({
    state: startState,
    parent: element
  })

  prettier
    .format(text, {
      parser: "json",  // Use "babel", "html", "css", or "json" as needed
      plugins: [parserBabel, prettierPluginEstree]
    })
    .then(
      (formattedText) => {
        view.dispatch({
          changes: { from: 0, to: text.length, insert: formattedText.trim() } // Replace text with formatted code
        });
      },
      (reason) => {
        console.log(`parsing using 'json' failed due to ${reason}`);
      }
    );
}

// Expose it to the global scope
// not needed for the playground
window.setupJsonViewer = setupJsonViewer;