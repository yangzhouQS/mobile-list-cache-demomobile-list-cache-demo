const assemEditor = require('../service/assem-editor-service')

function createAssemEditRoute(configure, service) {
  service.post('page-assem-write-json', async (ctx, next) => {
    ctx.body = await assemEditor.assemWriteJson(ctx, configure)
  })
  service.post('page-assem-read-json', async (ctx, next) => {
    ctx.body = await assemEditor.assemReadJson(ctx, configure)
  })
  service.post('/assem/page-assem-models', async (ctx, next) => {
    ctx.body = await assemEditor.queryModels(ctx, configure)
  })
  service.post('/assem/page-assem-filter', async (ctx, next) => {
    ctx.body = await assemEditor.queryFilter(ctx, configure)
  })
  service.post('/assem/page-assem-form', async (ctx, next) => {
    ctx.body = await assemEditor.queryForm(ctx, configure)
  })
  service.get('/assem/assem-env', async (ctx, next) => {
    ctx.body = await assemEditor.queryAssemEnv(ctx, configure)
  })

  // 历史记录列表
  service.post('/assem/history-list', async (ctx, next) => {
    ctx.body = await assemEditor.getHistoryCacheList(ctx, configure)
  })

  // 单条历史记录详情
  service.post('/assem/history-item', async (ctx, next) => {
    ctx.body = await assemEditor.getHistoryCacheItem(ctx, configure)
  })

  // 单条缓存
  service.post('/assem/cache-history-item', async (ctx, next) => {
    ctx.body = await assemEditor.setHistoryCache(ctx, configure)
  })
}


module.exports = createAssemEditRoute
