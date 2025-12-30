<template>
  <div class="progress-bar-container">
    <div class="progress-bar-bg">
      <div
        class="progress-bar-fill"
        :style="{ width: percentage + '%', backgroundColor: barColor }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  current: number;
  max: number;
}>();

const percentage = computed(() => {
  if (props.max === 0) return 0;
  return Math.min((props.current / props.max) * 100, 100);
});

const barColor = computed(() => {
  return "#1468e5";
});
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
}

.progress-bar-bg {
  width: 100%;
  height: 20px;
  background-color: #F8F8F8;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.5s ease-in-out, background-color 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-text {
  color: #000000;
  font-weight: bold;
  font-size: 0.9rem;
  white-space: nowrap;
}
</style>
