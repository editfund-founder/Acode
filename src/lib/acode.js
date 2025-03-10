import commands from "./commands";
import fsOperation from "./fileSystem/fsOperation";
import helpers from "./utils/helpers";
import Url from "./utils/Url";

export default class Acode {
  #pluginsInit = {};
  #pluginUnmount = {};
  #formatter = [{
    id: 'default',
    exts: ['*'],
    format: async () => {
      const { beautify } = ace.require('ace/ext/beautify')
      beautify(editorManager.editor.session);
    }
  }];

  exec(key, val) {
    if (key in commands) {
      return commands[key](val);
    } else {
      return false;
    }
  }
  get exitAppMessage() {
    const numFiles = editorManager.hasUnsavedFiles();
    if (numFiles) {
      return strings['unsaved files close app'];
    }
  }
  setLoadingMessage(message) {
    document.body.setAttribute('data-small-msg', message);
  }
  setPluginInit(id, initFunction) {
    console.log('initPlugin', id);
    this.#pluginsInit[id] = initFunction;
  }
  setPluginUnmount(id, unmountFunction) {
    console.log('unmountPlugin', id);
    this.#pluginUnmount[id] = unmountFunction;
  }
  /**
   * 
   * @param {string} id plugin id
   * @param {string} baseUrl local plugin url
   * @param {HTMLElement} $page 
   */
  initPlugin(id, baseUrl, $page, options) {
    if (id in this.#pluginsInit) {
      this.#pluginsInit[id](baseUrl, $page, options);
    }
  }
  unmountPlugin(id) {
    if (id in this.#pluginUnmount) {
      this.#pluginUnmount[id]();
      fsOperation(Url.join(CACHE_STORAGE, id)).delete();
    }
  }
  registerFormatter(id, extensions, format) {
    this.#formatter.unshift({
      id,
      exts: extensions,
      format,
    });
  }
  async format() {
    const file = editorManager.activeFile;
    const ext = helpers.extname(file.name);
    const formatter = this.#formatter.find((f) => f.exts.includes(ext) || f.exts.includes('*'));
    if (formatter) {
      await formatter.format();
    }
  }
  fsOperation(file) {
    return fsOperation(file);
  }
}