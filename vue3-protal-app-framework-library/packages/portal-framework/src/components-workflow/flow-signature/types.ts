/** 当前签章配置 */
export interface ICurrentSignatureConfigType {
  config?: {
    source?: string;
    code?: string;
    label: string;
  };
  orgId?: number;
  sourceId?: string;
  oriId?: string;
}
