import { WEBGL } from 'three/examples/jsm/WebGL.js';
import { Viewer } from './viewer.js';
import { SimpleDropzone } from 'simple-dropzone';
import { ValidationController } from './validation-controller.js';
import queryString from 'query-string';

if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
  console.error('The File APIs are not fully supported in this browser.');
} else if (!WEBGL.isWebGLAvailable()) {
  console.error('WebGL is not supported in this browser.');
}

const fileName = 'Hydrangea'

class App {

  /**
   * @param  {Element} el
   * @param  {Location} location
   */
  constructor (el, location) {

    console.log('location', location);
    const hash = location.hash ? queryString.parse(location.hash) : {};
    console.log('hash', hash);
    this.options = {
      kiosk: Boolean(hash.kiosk),
      model: hash.model || fileName,
      preset: hash.preset || '',
      cameraPosition: hash.cameraPosition
        ? hash.cameraPosition.split(',').map(Number)
        : null
    };

    this.el = el;
    this.viewer = null;
    this.viewerEl = null;
    this.spinnerEl = el.querySelector('.spinner');
    this.sceneEl = el.querySelector('.scene');
    this.inputEl = el.querySelector('#file-input');
    this.validationCtrl = new ValidationController(el);

    const options = this.options;

    if (options.kiosk) {
      const headerEl = document.querySelector('header');
      headerEl.style.display = 'none';
    }

    if (options.model) {
      this.view(options.model, '', new Map());
    }
  }

  /**
   * Sets up the view manager.
   * @return {Viewer}
   */
  createViewer () {
    this.viewerEl = document.createElement('div');
    this.viewerEl.classList.add('viewer');
    this.sceneEl.innerHTML = '';
    this.sceneEl.appendChild(this.viewerEl);
    this.viewer = new Viewer(this.viewerEl, this.options);
    return this.viewer;
  }

  /**
   * Passes a model to the viewer, given file and resources.
   * @param  {File|string} rootFile
   * @param  {string} rootPath
   * @param  {Map<string, File>} fileMap
   */
  view (modelName) {

    if (this.viewer) this.viewer.clear();

    const viewer = this.viewer || this.createViewer();

    const cleanup = () => {
      this.hideSpinner();
    };

    viewer
      .load(modelName)
      .catch((e) => this.onError(e))
      .then((gltf) => {
        // if (!this.options.kiosk) {
        //   this.validationCtrl.validate(fileURL, rootPath, fileMap, gltf);
        // } // TOODO add validation
        cleanup();
      });
  }

  /**
   * @param  {Error} error
   */
  onError (error) {
    let message = (error||{}).message || error.toString();
    if (message.match(/ProgressEvent/)) {
      message = 'Unable to retrieve this file. Check JS console and browser network tab.';
    } else if (message.match(/Unexpected token/)) {
      message = `Unable to parse file content. Verify that this file is valid. Error: "${message}"`;
    } else if (error && error.target && error.target instanceof Image) {
      message = 'Missing texture: ' + error.target.src.split('/').pop();
    }
    window.alert(message);
    console.error(error);
  }

  showSpinner () {
    this.spinnerEl.style.display = '';
  }

  hideSpinner () {
    this.spinnerEl.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const app = new App(document.body, location);

});
