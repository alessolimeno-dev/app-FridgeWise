<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- router-view carica dinamicamente la vista corrispondente all'URL -->
    <div class="flex-grow-1">
      <RouterView />
    </div>
  </div>
  <!-- Footer visibile in tutte le pagine solo nella versione desktop -->
  <Footer class="d-none d-md-block app-desktop-footer mt-auto" />
</template>

<script>
import Footer from './components/layout/footer.vue';

export default {
  name: 'App',
  components: {
    Footer
  }
}
</script>