import * as monaco from 'monaco-editor';
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

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: []
});
