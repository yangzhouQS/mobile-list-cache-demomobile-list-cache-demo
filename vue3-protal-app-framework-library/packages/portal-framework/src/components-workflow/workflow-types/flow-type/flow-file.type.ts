/**
 * 附件上传类型
 */
interface FileAttachmentType {
  id: string;
  createdAt: string;
  creatorId: string;
  creatorName: string;
  modifiedAt: string;
  modifierId: string;
  modifierName: string;
  isRemoved: boolean;
  version: number;
  tenant: string;
  orgId: number;
  orderId: string;
  product: string;
  module: string;
  name: string;
  url: string;
  size: string;
  type: string;
  remark: string;
  sortCode?: any;
  title?: any;
  isExpand?: any;
  msgContent?: any;
  pcUrl?: any;
  isNeedDispose?: any;
  isRead?: any;
  msgDisposeResult?: any;
}
export type { FileAttachmentType };
