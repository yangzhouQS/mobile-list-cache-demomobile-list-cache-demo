import { unset } from "lodash";
import ISignConfigType, { formatSignConfigData } from "./flow-event-utils";
import { $http } from "../../utils";

/**
 * 查询配置数据
 * @param orgId
 * @param tenantId
 * @param categoryCodes
 * @returns {Promise<ISignConfigType[]>}
 */
export function queryConfigData({ orgId, tenantId, categoryCodes }): Promise<ISignConfigType[]> {
  return new Promise(resolve => {
    if (!Array.isArray(categoryCodes) || categoryCodes.length === 0) {
      resolve([]);
      return;
    }

    const params = {
      defaultDescendant: true,
      namespaceCode: "sysConfig",
      categoryCodes: categoryCodes.join(","),
      orgId,
      tenantId
    };

    $http
      .get<Record<string, any>>(`/shared-data/configuration/get-category-config-data`, { params })
      .then(res => {
        const data = res.data;
        unset(data, categoryCodes[0]);
        const signatureOptions = formatSignConfigData(res.data);
        resolve(signatureOptions);
      })
      .catch(error => {
        console.log(error);
        resolve([]);
      });
  });
}
