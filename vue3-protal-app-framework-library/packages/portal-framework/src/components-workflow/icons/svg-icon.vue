<template>
  <svg :class="iconClass" :viewBox="viewBox" version="1.1" xmlns="http://www.w3.org/2000/svg"
       :width="width" :height="height"
  >
    <slot></slot>
  </svg>
</template>

<script>
export default {
  name: "svg-icon",
  props:{
    iconClass: {
      type: String,
      default: ''
    },
    viewBox: {
      type: String,
      default: '0 0 1024 1024'
    },
    width:{
      type: [Number,String],
      default: 16
    },
    height:{
      type: [Number,String],
      default: 16
    }
  },
  computed: {
    svgClass() {
      if (this.iconClass) {
        return 'svg-icon ' + this.iconClass
      } else {
        return 'svg-icon ' + this.className
      }
    }
  }
}
</script>

<style scoped lang="postcss">

</style>
