import { find, isEmpty } from "lodash";

/*
{
    "temporary-plan-1-signature": {
        "temporaryPlanSignature1Index": 1,
        "temporaryPlanSignature1Label": "项目经理"
    },
    "temporary-plan-2-signature": {
        "temporaryPlanSignature2Label": "分管领导",
        "temporaryPlanSignature2Index": 2
    },
    "temporary-plan-3-signature": {
        "temporaryPlanSignature3Label": "物资设备主管",
        "temporaryPlanSignature3Index": 3
    },
    "temporary-plan-4-signature": {
        "temporaryPlanSignature4Index": 4,
        "temporaryPlanSignature4Label": "编制人"
    }
}
* */

/**
 * 格式化签名配置数据
 * [
 *   {
 *     label: '项目经理',
 *     keyLabel: 'temporaryPlanSignature1Label',
 *     keyIndex: 'temporaryPlanSignature1Index',
 *     code: 'temporary-plan-1-signature',
 *     index: 1
 *   },
 *   {
 *     label: '分管领导',
 *     keyLabel: 'temporaryPlanSignature2Label',
 *     keyIndex: 'temporaryPlanSignature2Index',
 *     code: 'temporary-plan-2-signature',
 *     index: 2
 *   },
 *   {
 *     label: '物资设备主管',
 *     keyLabel: 'temporaryPlanSignature3Label',
 *     keyIndex: 'temporaryPlanSignature3Index',
 *     code: 'temporary-plan-3-signature',
 *     index: 3
 *   },
 *   {
 *     label: '编制人',
 *     keyLabel: 'temporaryPlanSignature4Label',
 *     keyIndex: 'temporaryPlanSignature4Index',
 *     code: 'temporary-plan-4-signature',
 *     index: 4
 *   }
 * ]
 * @param data
 * @returns {*[]}
 */
export function formatSignConfigData(data = {}): ISignConfigType[] {
  const result: ISignConfigType[] = [];
  if (isEmpty(data)) {
    return [];
  }
  // 所有配置的项的key
  const keys = Object.keys(data);
  for (const key of keys) {
    const item = data[key];
    if (isEmpty(item)) {
      continue;
    }
    const configKeys = Object.keys(item);
    // 0.编码 keu
    // 1.名称
    const keyLabel = find(configKeys, k => {
      return `${k}`.toLowerCase().includes("label".toLowerCase());
    });
    // 2.顺序
    const keyIndex = find(configKeys, k => {
      return `${k}`.toLowerCase().includes("index".toLowerCase());
    });
    // 3.来源 source
    const keySource = find(configKeys, k => {
      return `${k}`.toLowerCase().includes("source".toLowerCase());
    });
    // 4.是否启用 enable
    const keyEnable = find(configKeys, k => {
      return `${k}`.toLowerCase().includes("enable".toLowerCase());
    });
    // 5.角色ID roleId
    const keyRoleId = find(configKeys, k => {
      return `${k}`.toLowerCase().includes("roleId".toLowerCase());
    });
    // 6.角色名称 roleName
    const keyRoleName = find(configKeys, k => {
      return `${k}`.toLowerCase().includes("roleName".toLowerCase());
    });

    const indexValue = item[keyIndex] || 1;
    const labelValue = item[keyLabel] || "默认值";

    const sourceValue = item[keySource] || "";
    const enableValue = item[keyEnable] || "";
    const roleIdValue = item[keyRoleId] || "";
    const roleNameValue = item[keyRoleName] || "";

    const config = {
      config: {
        label: labelValue,
        code: key,
        index: indexValue,
        source: sourceValue,
        enable: enableValue,
        roleId: roleIdValue,
        roleName: roleNameValue
      },
      rawData: Object.assign(item, { code: key })
    };

    result.push(config);
  }
  return result;
}

/**
 * 签字配置项格式化数据结构
 */
export default interface ISignConfigType {
  config?: ILineConfigType;
  rawData?: RawData;
}

/**
 * 一个签字项配置
 */
export interface ILineConfigType {
  label?: string;
  code?: string;
  index?: number;
  source?: string;
  enable?: boolean;
  roleId?: string;
  roleName?: string;
}

/**
 * 每个配置项的原始数据
 */
export interface RawData {
  temporaryPlanSignature4Display?: boolean;
  temporaryPlanSignature4RoleId?: string;
  temporaryPlanSignature4Index?: number;
  temporaryPlanSignature4Label?: string;
  temporaryPlanSignature4Source?: string;
  temporaryPlanSignature4Enable?: boolean;
  temporaryPlanSignature4RoleName?: string;
  code?: string;
  [key: string]: any;
}
