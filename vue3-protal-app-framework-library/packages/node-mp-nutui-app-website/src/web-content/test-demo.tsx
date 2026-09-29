import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export const TestDemo = defineComponent({
  name: 'TestDemo',
  setup(props) {
    const router = useRouter()
    return () => {
      return <div>
        <nut-button onClick={()=>{
          router.push('/InnerTaskToMe')
        }}>
          测试
        </nut-button>
        component name: TestDemo Lorem ipsum dolor sit amet, consectetur adipisicing elit. Repellat, ut?
      </div>
    }
  }
})
