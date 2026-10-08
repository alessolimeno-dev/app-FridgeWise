<template>
  <div class="container d-flex flex-column align-items-center justify-content-center text-center not-found-container py-5">
    <div class="icon-circle mb-4 shadow-sm d-flex align-items-center justify-content-center">
      <AppLogo style="width: 7rem; height: 7rem;"></AppLogo>
    </div>
    <span class="badge bg-custom-orange mb-2 px-3 py-2 fw-bold text-white rounded-pill">
      Errore 404
    </span>
    <h1 class="titoletto display-6 mb-3">Piatto vuoto!</h1>

    <p class="text-muted col-10 col-md-8 mb-4">
      Abbiamo controllato in ogni ripiano della dispensa e nel frigo, ma la pagina che stai cercando è finita o non è mai esistita.
    </p>

    <BaseButton variant="primary" to="/" icon="bi-house-door" size="md">
      Torna alla schermata iniziale 
    </BaseButton>
  </div>
</template>