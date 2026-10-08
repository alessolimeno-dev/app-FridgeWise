<template>
  <footer class="app-footer py-2 px-3">
    <div class="container-fluid p-0 d-flex align-items-center justify-content-center flex-wrap gap-2 text-center small">
      
      <router-link to="/privacy-policy" class="footer-link" @click="$emit('close-sidebar')">
        Privacy Policy
      </router-link>

      <span class="footer-divider">•</span>

      <span class="footer-text text-nowrap">P.IVA 00000000000</span>

      <span class="footer-divider">•</span>

      <a href="mailto:info@fridgewise.it" class="footer-link text-nowrap">
        info@fridgewise.it
      </a>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  emits: ['close-sidebar']
}
</script>

