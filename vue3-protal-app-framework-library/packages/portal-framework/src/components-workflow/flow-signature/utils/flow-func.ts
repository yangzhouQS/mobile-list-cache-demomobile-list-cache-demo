import { get } from "lodash";
import { $http } from "../../../utils";

/**
 * 签名配置项原始数据结构
 */
interface RawSignatureConfigItem {
  [key: string]: any;
}

/**
 * 签名配置数据结构
 */
interface SignatureConfigItem {
  config: {
    label: string;
    code: string;
    index: number;
    source: string;
    enable: string;
    roleId: string;
    roleName: string;
  };
  rawData: RawSignatureConfigItem & { code: string };
}

/**
 * 格式化 handler
 * @param handler 以逗号分隔的 handler 字符串
 * @returns 解析后的 handler 数组
 */
export function formatHandler(handler: string): string[] {
  if (!handler) return [];
  let handlerArr = handler.split(",");
  handlerArr = handlerArr.filter(item => item.startsWith("r_"));
  handlerArr = handlerArr
    .map(item => {
      return item.split("_")[1];
    })
    .filter(Boolean);
  return handlerArr;
}

/**
 * 将 base64 数据转换为 Blob 对象
 * @param base64 base64 格式的图片数据
 * @returns Blob 对象
 */
export function base64ToBlob(base64: string): Blob {
  // 提取 MIME 类型
  const parts = base64.split(";base64,");
  const contentType = parts[0].split(":")[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * 查询全局的签章配置
 * @returns 签章配置值，默认为 0
 */
export function queryGlobalSignatureConfig(): Promise<number> {
  return new Promise(resolve => {
    $http
      .get(
        `/shared-data/configuration/get-category-config-data?namespaceCode=sysConfig&categoryCodes=global&paramsKey=referenceSignature&orgId=0`
      )
      .then((res: any) => {
        resolve(get(res.data, "global.referenceSignature", 0));
      })
      .catch(() => {
        resolve(0);
      });
  });
}

/**
 * 保存签章数据
 * body.categoryCode：签字配置类别，服务内部会根据当前编码查询所有的签字项配置，不存在的签字项会进行创建；不传就只处理当前signature签字项数据
 * body.signature
 * {
 *  "categoryCode": "temporary-signature",
 *  "signature": {
 *    "productCode": "cbaseinfo",
 *    "oriId": "",
 *    "orgId": 1342955240127488,
 *    "sourceId": 2028846780921344, // 业务单据主键
 *    "signatureCode": "temporary-plan-1-signature",
 *    "url": "flowTask/328fb79f-a7a6-4779-bad9-3d57f2148af0.png",
 *    "userId": 761023283016704,
 *    "signer": "###水电费",
 *    "remark": "审批流程保存签字照片",
 *    "extField": ""
 *  }
 * }
 * @param {Record<string, any>} params
 * @returns {Promise<unknown>}
 */
export function saveSignatureData(params: Record<string, any>) {
  return $http.post("/shared-data/g-signature", params);
}
