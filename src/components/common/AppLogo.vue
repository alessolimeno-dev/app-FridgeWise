<template>
  <img 
    :src="logoApp" 
    alt="FridgeWise Logo" 
    class="app-logo" 
  />
</template>
<script>
import logoApp from '@/assets/icona-FW.png'
export default {
  name: 'AppLogo',
  data() {
    return {
      logoApp
    }
  }
}
</script>
<style scoped>
.app-logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
  display: block;
}
</style>