import { computed, defineComponent } from "vue";
import { appStore } from "../../store/frame-store";
import { searchOrgNodes, loadMoreOrgNodes } from "../../store/ctx-request";
import { getCurrentInstance, getSearchUrlParams, goRedirect, nodeIconClass } from "../../utils/helpers";
import { OrgNodeType, TypeTreeViewParams } from "../../types";

/**
 * portal-header 头部组织机构切换组件
 */
export const AppHeader = defineComponent({
  name: "AppHeader",
  setup() {
    const vm = getCurrentInstance("AppHeader");
    const { __queryParams } = vm.appContext!.config as any;
    const store = appStore();
    /*const limit = ref(10);

    const defaultProps = ref({
      label: "shortName",
      children: "children",
      disabled: "disabled",
      value: "id"
    });*/

    const orgRoot = computed(() => {
      const orgRoot = store.orgRoot;
      return [orgRoot];
    });

    const handleNodeClick = (node: any) => {
      const params = getSearchUrlParams();
      if (__queryParams) {
        Object.assign(params, __queryParams);
      }

      // 其他参数会丢失，先不处理
      if (node && node.id > 0 && params.applicationId) {
        goRedirect(params.applicationId as any, node.id);
        // window.location.href = location.pathname + `?applicationId=${params.applicationId}&orgId=${node.key}${location.hash}`
      }
    };

    /**
     * 选择节点清空
     * @param node
     */
    const handleClear = () => {
      // console.log("handleClear");
    };

    const loadSearchData = ({ done, fail, filterVal }: any) => {
      searchOrgNodes({ key: `${filterVal}`.trim() })
        .then(data => {
          if (Array.isArray(data)) {
            data.forEach(item => {
              item.disabled = !item.isValid;
            });
            done(data);
          }
        })
        .catch(error => {
          fail(error);
        });
    };

    const loadTreeData = (params: TypeTreeViewParams) => {
      const { data, done, fail } = params;
      const { offset, limit } = params.paginationParams;
      loadMoreOrgNodes(Object.assign(data, { offset }) as OrgNodeType, limit)
        .then(data => {
          if (Array.isArray(data)) {
            done(data);
          } else {
            done([]);
          }
        })
        .catch(error => {
          console.log(error);
          fail();
        });
    };

    const renderIconNode = (item: OrgNodeType, isRenderSub = false) => {
      const label = item.shortName || item.name || "";
      return (
        <div class={[`app-org-search-node-item`]}>
          <div class={"app-org-search-node-title text-truncate"}>
            <i class={[nodeIconClass(item), "search-node-icon"]} />
            &nbsp;
            {label}
          </div>

          {isRenderSub && <div class={[`app-org-search-node-subtitle`]}>{item.fullName}</div>}
        </div>
      );
    };

    return () => {
      return (
        <div class={["app-main__header"]}>
          <nut-search-tree
            enableSearch={true}
            modelValue={store.currentOrg.id}
            default-text={store.currentOrg.shortName || store.currentOrg.name}
            class="app-org-tree-popover"
            customClass="my-org-tree-popover-content"
            popup-content-style={{ minWidth: "80vw", maxHeight: "400px", height: "300px" }}
            data={orgRoot.value}
            defaultProps={{
              label: "shortName",
              children: "children",
              disabled: "disabled",
              value: "id"
            }}
            treeProps={{
              limit: 10,
              expanded: [store.orgRoot?.id]
            }}
            onClear={handleClear}
            onNodeClick={handleNodeClick}
            onLoadSearchData={loadSearchData}
            onLoadTreeData={loadTreeData}
          >
            {{
              listItem: ({ item }: any) => {
                return renderIconNode(item, true);
              },
              treeItem: ({ node }: any) => {
                return renderIconNode(node);
              }
            }}
          </nut-search-tree>
        </div>
      );
    };
  }
});
