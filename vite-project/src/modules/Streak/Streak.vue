<template>
  <div class="h-full w-full p-2 flex flex-col justify-between items-center relative streak">
    <div>
    <!-- Fire Emoji -->
    <div class="text-[5rem]">🔥</div>

    <!-- Day Counter -->
    <div class="text-4xl font-bold text-orange-600">
      {{ streakCount }}
    </div>
  </div>
  </div>
</template>

<script setup>
const streakCount = 69 // hardcoded for now
</script>

<style scoped>
.streak {
  border-width: 5px;
  border-color: orange;
  border-radius: 5%;
}
</style>
