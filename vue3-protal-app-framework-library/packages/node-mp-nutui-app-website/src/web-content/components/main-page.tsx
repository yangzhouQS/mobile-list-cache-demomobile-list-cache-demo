import { computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import {appStore,openMenu} from '@yearrow/vue3-portal-app-framework-library'
import {Dongdong} from "@nutui/icons-vue"

const FlexConfig = [
  {
    tag: 'item-1',
    isFixed: false,
    size: '',
    paddingSize: 'large',
    clearPadding: []
  }
]

export const MainPage = defineComponent({
  name: 'MainPage',
  setup() {
    const store = appStore()
    const router = useRouter()

    const menus = computed(() => store.menus)
    const link = (routerName: string) => {
      return () => router.push(`/${routerName}`)
    }

    const handleTest = () => {
      console.log(store);
    }

    const handleClick = (item) => {
      openMenu(item)
    }

    return () => {
      return <div class={'main-page'}>
        <nut-grid column-num={3}>
          {
            menus.value.map((item,index) => {
              return <nut-grid-item key={index} onClick={handleClick.bind(null,item)} text={item.aliasName}><Dongdong/></nut-grid-item>
            })
          }
        </nut-grid>
        <nut-flex-box itemNum={FlexConfig.length} item-config={FlexConfig}>
          {{
            'item-1': () => {
              return <div>
                <nut-row gutter={10}>
                  <nut-col span={12}>
                    <nut-button type="primary" block onClick={link('index-demo')}>
                      演示
                    </nut-button>
                  </nut-col>
                  <nut-col span={12}>
                    <nut-button type="primary" block onClick={link('flow-demo')}>
                      审批流
                    </nut-button>
                  </nut-col>
                </nut-row>
                <nut-row gutter={10} class={'mt-5'} >
                  <nut-col span={8}>
                    <nut-button type="primary" block onClick={link('InnerTaskToMe')}>
                      测试
                    </nut-button>
                  </nut-col>

                  <nut-col span={8}>
                    <nut-button type="primary" block onClick={handleTest}>
                      上下文打印
                    </nut-button>
                  </nut-col>
                  <nut-col span={8}>
                    <nut-button type="primary" block onClick={link('TabsTest')}>
                      tabs
                    </nut-button>
                  </nut-col>
                </nut-row>
              </div>
            }
          }}
        </nut-flex-box>
      </div>
    }
  }
})
