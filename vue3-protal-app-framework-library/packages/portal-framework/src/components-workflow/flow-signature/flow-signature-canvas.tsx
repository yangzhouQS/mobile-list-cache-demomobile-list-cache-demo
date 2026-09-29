import { defineComponent, nextTick, onMounted, reactive, ref } from "vue";
import type { PropType } from "vue";
// @ts-ignore - 外部依赖可能缺少类型声明
import { uploadFile } from "@mctech/js-fs-client/src/file-service.js";
// @ts-ignore - smooth-signature 可能缺少类型声明
import SmoothSignature from "smooth-signature";
import { $http, GlobalToast } from "../../utils";
import { base64ToBlob, queryGlobalSignatureConfig } from "./utils/flow-func";
import { useContext } from "../../hooks/useContext";
import "./flow-signature-canvas-style.less";
import { ICurrentSignatureConfigType } from "./types";

/**
 * 签名数据结果
 */
interface SignatureDataResult {
  isEmpty: boolean;
  base64: string;
}

/**
 * 上传文件参数
 */
interface UploadFileParams {
  key: string;
  product: string;
  moduleName: string;
  isAllowRepeated: boolean;
  singleSignatureURL: string;
  fileObject: Blob;
  success: (data: any) => void;
  error: (err: any) => void;
}

/** 签字参数数据 */
interface SignatureParamsData {
  id: string;
  orgId: number;
  oriId: string;
  tenantId: number;
  signatureSource: string;
  signatureCode: string;
  userId: number;
  userName: string;
  width: number;
  height: number;
}

/**
 * 流程签名画布组件
 * 提供手写签名、清除、撤销、引用签章等功能
 */
export const FlowSignatureCanvas = defineComponent({
  name: "FlowSignatureCanvas",
  props: {
    /** 当前签章配置 */
    currentSignatureConfig: {
      type: Object as PropType<ICurrentSignatureConfigType>,
      default: () => ({})
    }
  },
  setup(props, { expose, slots }) {
    const ctx = useContext();

    // ============================ 响应式状态 ============================
    const loading = ref(false);
    const imgLoading = ref(false);
    // 签章引用模式：-999 默认、0 仅签名、1 签名+签章、2 仅签章
    const referenceSignature = ref(-999);
    const importUserSignature = ref(false);
    const importUrl = ref("");
    const userSignatureTip = ref("");
    // SmoothSignature 实例
    const signature = ref<any>(null);
    const clientWidth = ref(320);

    // 签名上下文参数（对应 vue 版本的 paramsData）
    const paramsData = reactive<SignatureParamsData>({
      id: "",
      orgId: 0,
      oriId: null,
      tenantId: 0,
      signatureSource: "",
      signatureCode: "",
      userId: 0,
      userName: "",
      width: 550,
      height: 200
    });

    // 模板引用
    const canvasRef = ref<HTMLCanvasElement | null>(null);

    // ============================ 工具方法 ============================

    /**
     * 获取当前登录用户信息（全局注入属性）
     */
    const getUser = (): any => {
      return ctx.user;
    };

    // ============================ 业务方法 ============================

    /**
     * 保存签字
     */
    const saveSignature = () => {
      console.log("saveSignature 保存签字");
    };

    /**
     * 获取签名数据
     * @returns 签名数据（是否为空 + base64 图片）
     */
    const getSignatureData = (): SignatureDataResult => {
      // 去除背景色，只保留签名部分
      handleBackground();

      const result: SignatureDataResult = {
        isEmpty: true,
        base64: signature.value ? signature.value.getPNG() : ""
      };

      result.isEmpty = signature.value && signature.value.isEmpty();

      return result;
    };

    /**
     * 上传签名文件
     * @returns 上传结果的 Promise
     */
    const uploadSignatureFile = (): Promise<any> => {
      const canvasBase64 = signature.value.getPNG();
      const urlObj = base64ToBlob(canvasBase64);

      imgLoading.value = true;
      return new Promise((resolve, reject) => {
        const postData: UploadFileParams = {
          key: Date.now() + "_.png",
          product: "cbaseinfo",
          moduleName: "flowTask",
          isAllowRepeated: true,
          singleSignatureURL: "/shared-data/fs/form-signature",
          fileObject: urlObj,
          success: (data: any) => {
            resolve(data);
            imgLoading.value = false;
          },
          error: (err: any) => {
            reject(err);
            imgLoading.value = false;
          }
        };
        uploadFile(postData);
      });
    };

    /**
     * 查询用户签名配置
     */
    const queryUserSignature = async () => {
      const user = getUser();
      if (!user || !user.id) {
        return;
      }
      importUserSignature.value = true;
      paramsData.signatureSource = "systemUserSignature";

      loading.value = true;

      const refSignature = await queryGlobalSignatureConfig();
      loading.value = false;

      referenceSignature.value = refSignature;
      console.log("this.referenceSignature = ", referenceSignature.value);

      if (referenceSignature.value === 2 && signature.value) {
        signature.value.removeListener();
      }

      $http
        .post("/shared-data/g-signature-user-params", {
          userId: user.id
        })
        .then((data: any) => {
          console.log(data);
          if (data && data.success && data.url) {
            importUserSignature.value = true;
            importUrl.value = data.url;
          } else {
            userSignatureTip.value = "未获取到用户签章";
          }
        });
    };

    /**
     * 引用签章图片到画布
     */
    const importImg = () => {
      if (!importUrl.value) {
        GlobalToast.error("当前用户没有签章");
        return false;
      }
      if (!signature.value || !importUrl.value) {
        return;
      }

      if (!signature.value.canvas) {
        return;
      }

      let url = importUrl.value;

      // 本地开发时，图片地址需要替换成本地地址，否则跨域问题会导致图片加载失败
      if (importUrl.value.includes("http://dev.mctech.vip") && !importUrl.value.includes(location.origin)) {
        url = importUrl.value.replace("http://dev.mctech.vip", location.origin);
      }

      // 手动控制存在问题，会马上覆盖
      console.log("drawByImageUrl => ", url);
      signature.value.drawByImageUrl(url);
    };

    /**
     * 下载用户签名
     * @param data 签名数据
     */
    const downloadUserSignature = (data: any) => {
      if (!data || !data.url) {
        return;
      }
      const param = {
        keys: [data.url],
        expires: 15,
        product: data.product || "cbaseinfo"
      };
      $http
        .post("/shared-data/fs/accesses", param)
        .then((res: any) => {
          if (res) {
            importUrl.value = res[data.url];
          } else {
            GlobalToast.warn("没有对应的资源内容");
          }
        })
        .catch(() => {
          GlobalToast.error("下载失败");
        });
    };

    /**
     * 清除签名
     */
    const handleClear = () => {
      if (signature.value) {
        signature.value.clear();
      }
    };

    /**
     * 撤销上一步签名
     */
    const handleUndo = () => {
      if (signature.value) {
        signature.value.undo();
      }
    };

    /**
     * 预览签名
     */
    const handlePreview = () => {
      if (!signature.value) {
        return;
      }
      const isEmpty = signature.value.isEmpty();
      if (isEmpty) {
        GlobalToast.warning("签字完成后再保存模板");
        return;
      }
      const pngUrl = signature.value.getPNG();
      (window as any).previewImage(pngUrl);
    };

    /**
     * 处理背景透明度
     */
    const handleBackground = () => {
      if (!signature.value) {
        return;
      }
      const canvasCtx = signature.value.ctx;
      const imageData = canvasCtx.getImageData(0, 0, signature.value.width, signature.value.height);
      const data = imageData.data;

      // 将白色背景区域设置为透明，只保留签名笔迹
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) {
          data[i + 3] = 0;
        }
      }
      canvasCtx.putImageData(imageData, 0, 0);
    };

    /**
     * 保存用户签名模板
     */
    const handleSaveUserSignature = () => {
      if (!signature.value) {
        return;
      }
      const isEmpty = signature.value.isEmpty();
      if (isEmpty) {
        GlobalToast.warning("签字完成后再保存模板");
        return;
      }

      const canvasBase64 = signature.value.getPNG();
      const urlObj = base64ToBlob(canvasBase64);

      const postData: UploadFileParams = {
        key: Date.now() + "_.png",
        product: "cbaseinfo",
        moduleName: "flowTask",
        isAllowRepeated: true,
        singleSignatureURL: "/shared-data/fs/form-signature",
        fileObject: urlObj,
        success: (data: any) => {
          uploadUserSignature(data);
        },
        error: () => {
          GlobalToast.error("签名模板上传失败");
        }
      };
      uploadFile(postData);
    };

    /**
     * 上传用户签名到服务端
     * @param uploadData 上传返回的数据
     */
    const uploadUserSignature = (uploadData: any) => {
      if (!uploadData) {
        return;
      }
      const user = getUser();
      $http
        .post("/shared-data/g-user-signature", {
          productCode: "cbaseinfo",
          type: "image/png",
          moduleName: "flowTask",
          userId: user.id,
          signer: user.name,
          remark: "审批流用户签名保存",
          url: uploadData.savedKey
        })
        .then((res: any) => {
          if (res.success) {
            GlobalToast.success("签名模板保存成功");
          } else {
            GlobalToast.error(res.message || "签名模板保存失败");
          }
        })
        .catch((err: any) => {
          console.log(err);
          GlobalToast.error("签名模板保存失败");
        });
    };

    /**
     * 初始化签名画布
     * @param el canvas 元素
     */
    const initCanvas = (el: HTMLCanvasElement | null) => {
      if (!el) {
        return;
      }

      if (!SmoothSignature) {
        throw new Error("SmoothSignature 未引入");
      }

      const options = {
        height: 200,
        // 画笔最小宽度(px)，开启笔锋时画笔最小宽度
        minWidth: 2,
        // 画笔最大宽度(px)，开启笔锋时画笔最大宽度，或未开启笔锋时画笔正常宽度
        maxWidth: 6,
        bgColor: "", // 不传背景就是透明的
        onStart: () => {
          // console.log('onStart')
        },
        onEnd: () => {
          // console.log('onEnd')
        }
      };
      if (!signature.value) {
        signature.value = new SmoothSignature(el, options);
      }

      if (referenceSignature.value === 2) {
        signature.value.removeListener();
      }

      console.log("canvas 初始化完成");
    };

    const isEmpty = () => {
      if (!signature.value) {
        return true;
      }
      return signature.value.isEmpty();
    };

    // ============================ 生命周期 ============================

    onMounted(() => {
      console.log("flow-signature-canvas mounted---------");
      const user = getUser();
      // 初始化签名上下文参数（对应 vue 版本 mounted 逻辑）
      paramsData.tenantId = ctx.$context.tenantId;
      if (user) {
        paramsData.userId = user.id;
        paramsData.userName = user.name;
      }
      if (props.currentSignatureConfig && props.currentSignatureConfig.config) {
        paramsData.signatureSource = props.currentSignatureConfig.config.source || "";
        paramsData.signatureCode = props.currentSignatureConfig.config.code || "";
        paramsData.orgId = props.currentSignatureConfig.orgId || 0;
        paramsData.id = props.currentSignatureConfig.sourceId || "";
        paramsData.oriId = props.currentSignatureConfig.oriId || "";
      }

      queryUserSignature();
      nextTick(() => {
        clientWidth.value = document.body.clientWidth;
        if (canvasRef.value) {
          initCanvas(canvasRef.value);
        }
      });
      userSignatureTip.value = "";
    });

    // 暴露给父组件调用的方法
    expose({
      getSignatureData,
      uploadSignatureFile,
      saveSignature,
      handleClear,
      handleUndo,
      importImg,
      isEmpty
    });

    // ============================ 渲染函数 ============================

    return () => {
      return (
        <div class={["signature-canvas-wrap"]}>
          <div class="signature-canvas-container">
            {/* 非全屏状态下的签名画布 */}
            <canvas ref={canvasRef} class="signature-canvas" style={{ width: "100%" }} />
          </div>
          <div class={"signature-canvas-tips"}>{slots.tips?.() || "签字需手动保存"}</div>

          {/* 非全屏状态操作按钮 */}
          <div class="signature-canvas-actions">
            <nut-button shape="square" type="danger" onClick={handleClear} plain={true} size={"small"}>
              清除
            </nut-button>
            {importUserSignature.value && [1, 2].includes(referenceSignature.value) && (
              <nut-button shape="square" type="primary" class="ml-10" onClick={importImg} plain={true} size={"small"}>
                引用签章
              </nut-button>
            )}
            {/* 只允许签章时，禁止撤销 */}
            {[0, 1].includes(referenceSignature.value) && (
              <nut-button shape="square" type="danger" class="ml-10" onClick={handleUndo} plain={true} size={"small"}>
                撤销
              </nut-button>
            )}
          </div>

          {userSignatureTip.value && <div style={{ color: "red", fontSize: "14px" }}>{userSignatureTip.value}</div>}
        </div>
      );
    };
  }
});

export default FlowSignatureCanvas;
