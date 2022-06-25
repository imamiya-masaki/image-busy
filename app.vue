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
          src: "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js"
        }
      ]
    }
  }

}
</script>