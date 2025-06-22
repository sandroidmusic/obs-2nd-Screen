<script setup lang="ts">
  //---------------------------------------------------
  //
  //  Imports
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Properties
  //
  //---------------------------------------------------
  // const props = defineProps({});

  //---------------------------------------------------
  //
  //  Emits
  //
  //---------------------------------------------------
  // const emit = defineEmits([]);

  //---------------------------------------------------
  //
  //  Data Model
  //
  //---------------------------------------------------
  // const value = ref();

  //---------------------------------------------------
  //
  //  Computed Properties
  //
  //---------------------------------------------------
  // const computedProperty = computed(() => { return null; });

  //---------------------------------------------------
  //
  //  Watch Properties
  //
  //---------------------------------------------------
  // watch(value, (newval, oldval) => { console.log(newval, oldval); });

  //---------------------------------------------------
  //
  //  Vue Lifecycle
  //
  //---------------------------------------------------
  // onBeforeMount(() => {});
  // onMounted(() => {});
  // onBeforeUpdate(() => {});
  // onUpdated(() => {});
  // onActivated(() => {});
  // onDeactivated(() => {});
  // onBeforeUnmount(() => {});
  // onUnmounted(() => {});

  //---------------------------------------------------
  //
  //  Methods
  //
  //---------------------------------------------------

  //---------------------------------------------------
  //
  //  Expose
  //
  //---------------------------------------------------
  // defineExpose({});
</script>

<template>
  <div id="index">
    <div>OBS ²nd Screen</div>
    <div>
      <router-link to="/control">Control</router-link> |
      <router-link to="/overlay">Overlay</router-link>
    </div>
  </div>
</template>

<style lang="scss">
  @use '@/assets/scss/variables';

  #index {
    display: flex;
    flex-direction: column;
    gap: var(--baseunit);
    justify-content: center;
    align-items: center;
    height: 100svh;
    max-height: 100%;
    max-width: 100%;
    user-select: none;

    & > div {
      &:first-of-type {
        font-size: 2rem;
      }

      &:last-of-type {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: calc(var(--baseunit) * 2);

        & > a {
          font-weight: 300;
          text-decoration: none;
          color: inherit;
          text-transform: uppercase;

          &:hover {
            color: var(--color-accent);
          }
        }
      }
    }
  }
</style>
