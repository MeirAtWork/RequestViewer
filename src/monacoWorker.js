import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker&inline';

self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    return new editorWorker();
  }
};

// We need to import the language service to enable the language 
import { jsonDefaults } from 'monaco-editor/esm/vs/language/json/monaco.contribution';

jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: []
});
