<script setup lang="ts">
import { onMounted } from "vue";
import { VoucherBuild } from "../../HiVoucher";
import "../../HiVoucher/index.scss";

onMounted(() => {
  const voucher = new VoucherBuild("div.voucher-app-body");
  voucher.render();
});
</script>
<template>
  <div class="voucher-app-body"></div>
</template>
<style scoped>
.voucher-app-body {
  width: 100%;
  height: 100vh;
  background-color: #f6f6ff;
}
</style>
