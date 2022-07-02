<template>
<div>
    <PageHeader/>
    <NuxtPage />
  </div>
</template>

<script>

export default {
  head() {
    return {
      script: [
        {
          src: "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        }
      ]
    }
  }

}
</script>