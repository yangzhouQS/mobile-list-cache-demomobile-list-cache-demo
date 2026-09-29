const {assemEditorApi} = require("./editor-yearrow-config");

// assem 编辑器保存json接口
async function assemWriteJson(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    // path: "/custom/lowcodeServer/ConfItem",
    path: "/customConfigServer/lowcodeConfig",
    method: "put",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}

// assem 编辑器读取json接口
async function assemReadJson(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    // path: "/lowcodeServer/ConfItem/getModuleJson",
    path: "/customConfigServer/lowcodeConfig/getModuleJson",
    method: "get",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}


// 查询指定模块所有配置模型
async function queryModels(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: `/customConfigServer/model/getModuleModels`,
    method: "get",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}

/**
 * 动态过滤器配置查询 TODO 未使用
 * @param ctx
 * @param configure
 * @return {Promise<*>}
 */
async function queryFilter(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: `/customConfigServer/filter/getFilters`,
    method: "get",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}


/**
 * 动态表单查询 TODO 未使用
 * @param ctx
 * @param configure
 * @return {Promise<*>}
 */
async function queryForm(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: `/customConfigServer/form/getForms`,
    method: "get",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}


/**
 * 读取历史记录列表
 * 参数: (redisKey: string)
 * @param ctx
 * @param configure
 * @return {Promise<*>}
 */
async function getHistoryCacheList(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: `/customConfigServer/lowcodeConfig/getRedisLwConfigList`,
    method: "get",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}

/**
 * 根据索引单条读取缓存详情
 *  (redisKey: string, indexKey: number)
 * @param ctx
 * @param configure
 * @return {Promise<*>}
 */
async function getHistoryCacheItem(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: `/customConfigServer/lowcodeConfig/getRedisLwConfig`,
    method: "get",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}


/**
 * 操作历史记录写入
 * @param ctx
 * @param configure
 * @return {Promise<*>}
 */
async function setHistoryCache(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: `/customConfigServer/lowcodeConfig/lowCodeConfigToRedis`,
    method: "post",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}



/**
 * 自定义配置查询
 * @param ctx
 * @param configure
 * @return {Promise<*|{}>}
 */
async function queryAssemEnv(ctx, configure) {
  return configure._config.assemEnv || {}
}

module.exports = {
  assemWriteJson,
  assemReadJson,
  queryModels,
  queryForm,
  queryFilter,
  queryAssemEnv,
  getHistoryCacheList,
  getHistoryCacheItem,
  setHistoryCache
}
