<script setup lang="ts">
  //---------------------------------------------------
  //
  //  Imports
  //
  //---------------------------------------------------
  import { Action } from '@/types/interfaces.ts';
  import { computed, PropType } from 'vue';
  //---------------------------------------------------
  //
  //  Properties
  //
  //---------------------------------------------------
  const props = defineProps({
    action: {
      type: Object as PropType<Action>,
      required: true,
    },
  });

  //---------------------------------------------------
  //
  //  Emits
  //
  //---------------------------------------------------
  const emit = defineEmits(['action']);

  //---------------------------------------------------
  //
  //  Data Model
  //
  //---------------------------------------------------
  // const value = ref();
  // const value = defineModel({ type: Boolean, default: false });

  //---------------------------------------------------
  //
  //  Computed Properties
  //
  //---------------------------------------------------
  const computedStyle = computed(() => {
    const color = props.action?.color;
    if (color) {
      return `--color:${color}`;
    }
    return '';
  });

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
  <button
    type="button"
    class="toggle-button"
    :class="{ active: action.active }"
    :style="computedStyle"
    @click="emit('action')"
  >
    <img v-if="action.image" :src="action.image" :alt="action.label" />
    <span v-if="action.label">{{ action.label }}</span>
  </button>
</template>

<style lang="scss">
  @use '@/assets/scss/query';
  @use '@/assets/scss/variables';

  .toggle-button {
    --color: #a2a2a2;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    aspect-ratio: 1;
    border-radius: 16px;
    padding: 8px;
    font-family: inherit;
    text-transform: uppercase;
    font-weight: 400;
    font-size: 1.2rem;
    border: 2px solid transparent;
    background: rgb(25 25 25 / 30%);
    color: rgba(from var(--color-text-primary) r g b / 20%);
    box-shadow: inset 0 1px 5px var(--color-shadow1);
    transition:
      color 0.12s linear,
      border-color 0.12s linear;
    user-select: none;
    overflow: hidden;

    @include query.tablet-landscape {
      font-size: 1.1rem;
    }

    @include query.mobile {
      font-size: 0.75rem;
    }

    & > img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      mix-blend-mode: soft-light;
    }

    &:hover {
      border: 2px solid rgb(from var(--color) r g b / 10%);
      box-shadow:
        0 2px 5px black,
        0 0 10px rgb(from var(--color) r g b / 30%);
      color: rgba(from var(--color-text-primary) r g b / 50%);
    }

    &.active {
      box-shadow:
        0 2px 5px black,
        0 0 10px rgb(from var(--color) r g b / 30%);
      border: 2px solid black;
      background: linear-gradient(180deg, rgb(from var(--color) r g b / 69%), rgb(from var(--color) r g b / 20%));
      color: rgba(from var(--color-text-primary) r g b / 100%);

      & > img {
        opacity: 1;
        mix-blend-mode: overlay;
      }
    }
  }
</style>

<i18n />
