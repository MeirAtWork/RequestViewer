import * as monaco from 'monaco-editor';
import './monacoWorker';

export function setupMonacoJsonViewer(element, height, text) {
  // Set the container height
  element.style.height = height + 'px';

  const editor = monaco.editor.create(element, {
    value: text,
    language: 'json',
    readOnly: true, // Make it read-only
    minimap: { enabled: false }, // Disable minimap for cleaner view
    automaticLayout: true,
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    folding: true, // enables collapsible nodes
    wordWrap: "on",
    links: true, // enables clickable links
    contextmenu: false, // Disables the right-click context menu
    theme: 'vs-light',
  });

  // Trigger the built-in formatter
  setTimeout(() => {
    editor.getAction('editor.action.formatDocument').run();
  }, 100);

  return editor;
}

// Expose it to the global scope
window.setupMonacoJsonViewer = setupMonacoJsonViewer;
