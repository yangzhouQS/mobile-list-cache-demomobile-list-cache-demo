const flowDesignService = require('../service/flow-form-design-service')

function createRoute(configure, service) {

  // 表单设计器更新配置json数据
  service.post('/flow/query-form-config', async (ctx, next) => {
    ctx.body = await flowDesignService.queryFormConfig(ctx, configure)
  })

  service.post('/flow/update-form-json', async (ctx, next) => {
    ctx.body = await flowDesignService.updateFormConfig(ctx, configure)
  })

  service.get('/user-mobile-portal',async (ctx, next) => {
    ctx.body = await flowDesignService.getModelParams(ctx)
  })
}


module.exports = createRoute
