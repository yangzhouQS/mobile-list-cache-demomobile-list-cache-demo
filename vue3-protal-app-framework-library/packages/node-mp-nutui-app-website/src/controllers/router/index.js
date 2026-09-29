const createAssemEditRoute = require('./assem-editor-router')
const createFormDesignRoute = require('./flow-form-design-router')

module.exports = (configure, service) => {
  createAssemEditRoute(configure, service)
  createFormDesignRoute(configure, service)
}
