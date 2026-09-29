interface IPublicFlowDesignType {
  createdAt: string;
  id: string;
  tenantName: string;
  tenantId: number;
  orgId: number;
  orgName: string;
  flowName: string;
  flowFormId: string;
  flowFormName: string;
  flowState: number;
  sortCode: number;
}

export type { IPublicFlowDesignType };
