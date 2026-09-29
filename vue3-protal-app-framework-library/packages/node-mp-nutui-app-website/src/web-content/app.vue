 <template>
<!--  <keep-alive>
    <router-view></router-view>
  </keep-alive>-->
  <router-view></router-view>
<!--  <router-view v-slot="{ Component }">
    <vue-page-stack @back="onBack" @forward="onForward">
      <component :is="Component" :key="$route.fullPath"></component>
    </vue-page-stack>
  </router-view>-->
</template>
<script setup lang="ts">
import {appStore} from "@yearrow/vue3-portal-app-framework-library"
const store = appStore()
console.log(store);

const onBack = () => {
  console.log('back');
};

const onForward = () => {
  console.log('forward');
};
</script>
<style scoped>

</style>
