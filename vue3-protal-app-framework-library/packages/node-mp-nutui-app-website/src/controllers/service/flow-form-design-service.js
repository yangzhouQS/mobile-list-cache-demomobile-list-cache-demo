const {assemEditorApi} = require("./editor-yearrow-config");

/**
 * 根据id查询流程设计数据
 * @param ctx
 * @param configure
 * @return {Promise<*>}
 */
async function queryFormConfig(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: '/approveServer/flow-form',
    method: "get",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}


/**
 * 表单设计器更新配置json数据
 * @example
 * {
 *   "id": "string",
 *   "userInfo": {
 *     "id": {},
 *     "userName": "string"
 *   },
 *   "designJson": "string",
 *   "platform": "pc"
 * }
 * @param ctx
 * @param configure
 * @return {Promise<*>}
 */
async function updateFormConfig(ctx, configure) {
  const queryCondtion = ctx.request.body
  const result = await assemEditorApi({
    path: '/approveServer/flow-form/mc-update-config',
    method: "post",
    data: queryCondtion,
    yconfig: configure._config.yearrow
  });
  return result
}

async function getModelParams(ctx){
  const result = await ctx.rpc.get(
    {
      path: '/user-mobile-portal'
    },
    { serviceId: 'permission-service' }
  )
  return result
}



module.exports = {
  queryFormConfig,
  updateFormConfig,
  getModelParams
}
