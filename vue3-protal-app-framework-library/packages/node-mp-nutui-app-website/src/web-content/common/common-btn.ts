import {portalStore} from '@yearrow/vue3-web-framework-library'

export const useCommonBtnHook = (funBtnConf: any) => {
  const portal = portalStore()
  const permissions = portal.$context.permissions

  const getBtnList = (type = false) => {
    const newObj:any = {}
    for (const key in funBtnConf) {
      if (permissions.includes(funBtnConf[key].permissionSetting) && funBtnConf[key].isOffset === type) {
        newObj[key] = funBtnConf[key]
      }
    }
    return newObj
  }
  const btnList = getBtnList()
  const offsetBtnList = getBtnList(true)
  return {
    btnList,
    offsetBtnList
  }
}
