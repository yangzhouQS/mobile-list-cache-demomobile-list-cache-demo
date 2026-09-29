const { resolve, parse } = require('path')
const casClient = require('@mctech/cas-client')
const serverInstance = require('@mctech/infra-cloud').appServer({
  servicePath: '/nutui-app/',
  compress: true,
  bodyParser: {
    jsonLimit: 1000000 * 1024 * 1024,
    formLimit: 1000000 * 1024 * 1024,
    textLimit: 1000000 * 1024 * 1024
  }
})

const services = require('./router/index')
// 必须放在其它初始代码之前，以便对用户身份进行认证
casClient.load(serverInstance)
serverInstance.use((configure, service) => {
  // 映射网站资源
  service.useStatic(
    '/',
    parse(__dirname).base === 'controllers'
      ? resolve(__dirname, '..', '..', 'dist', 'web-content')
      : resolve(__dirname, 'web-content')
  )
  services(configure, service)
})
serverInstance.start()
