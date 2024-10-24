const axios = require('axios');
require('source-map-support/browser-source-map-support.js');

class ErrorMonitor {
  // static #APIendpoint = 'http://localhost:8000'; // Change to where the lambda runs
  static #APIendpoint = 'https://jvcrh631c5.execute-api.us-east-1.amazonaws.com/dev'

  constructor(projectID) {
    this.projectID = projectID; // TODO: needs to be generated and given to the user
    // this.releaseVersion = releaseVersion;
    sourceMapSupport.install();
    window.addEventListener('error', e => this.#handleUncaughtException(e));
    // window.addEventListener('unhandledrejection', e => this.#handleUnhandledRejection(e));
  }

  captureException(e) {
    this.#logError(e, true);
    next(e); // ???
  }

  // * --- Private Methods --- * //
  #handleUncaughtException(e) {
    this.#logError(e, false);
  }

  // #handleUnhandledRejection(e) {
  //   const { reason, promise } = e;
  //   const errorData = {
  //     type: "Unhandled promise rejection",
  //     message: reason?.message || 'Reason unknown',
  //     stack: reason?.stack || null,
  //     promise: promise.toString(),
  //     timestamp: new Date().toISOString(),
  //   }

  //   console.log(`Unhandled rejection: ${reason}\nPromise:`, promise);
  //   this.#logError(errorData);
  // }

  async #logError(error, handled) {
    const data = { 
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      handled,
      timestamp: new Date().toISOString(),
      project_id: this.projectID,
    }

    console.log('[error sdk] Sending error to backend...');
    const response = await axios.post(`${ErrorMonitor.#APIendpoint}/api/errors`, { data });
    console.log('[error sdk]', response.status, response.data.message );
  }
}

module.exports = ErrorMonitor;