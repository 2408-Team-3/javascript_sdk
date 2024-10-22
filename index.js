const axios = require('axios');
require('source-map-support/browser-source-map-support.js');

class ErrorSDK {
  constructor(projectID) {
    this.APIendpoint = 'http://localhost:8000';
    this.projectID = projectID; // TODO: needs to be generated and given to the user
    // this.releaseVersion = releaseVersion;
    this.#init();
  }

  captureException(e) {
    const errorData = this.#processErrorEvent(e);
    this.#logError(errorData);

    next(e); // ? Optional ?
  }

  // * --- Private Methods --- * //
  #init() {
    sourceMapSupport.install();
    window.addEventListener('error', e => this.#handleUncaughtError(e));
    window.addEventListener('unhandledrejection', e => this.#handleUnhandledRejection(e));
  }

  #handleUncaughtError(e) {
    console.log('[error sdk] unhandledException:');
    console.log('[error sdk]', e);

    const errorData = this.#processErrorEvent(e);
    this.#logError(errorData);
  }

  #handleUnhandledRejection(e) {
    const { reason, promise } = e;
    const errorData = {
      type: "Unhandled promise rejection",
      message: reason?.message || 'Reason unknown',
      stack: reason?.stack || null,
      promise: promise.toString(),
      timestamp: new Date().toISOString(),
    }

    console.log(`Unhandled rejection: ${reason}\nPromise:`, promise);
    this.#logError(errorData);
  }

  #processErrorEvent(e) {
    return {
      message: e.message,
      stack: e.error?.stack || null,
      time: new Date().toISOString(),
    }
  }

  async #logError(errorData, requestData = {}) {
    const data = { error: errorData, req: requestData }
    console.log('[error sdk] Sending error to backend...');
    const response = await axios.post(`${this.APIendpoint}/api/errors`, data);
    console.log('[error sdk]', response.status, response.data.message );
  }
}

module.exports = ErrorSDK;
