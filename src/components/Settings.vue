<script setup lang="ts">
  //---------------------------------------------------
  //
  //  Imports
  //
  //---------------------------------------------------
  import MonacoEditor from '@/components/MonacoEditor.vue';
  import { useStore } from '@/store.ts';
  import { computed, onMounted, ref } from 'vue';
  import { downloadJson, uploadJson } from '@/utils/Helpers.ts';
  import { AppConfig } from '@/types/interfaces.ts';

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
  const emit = defineEmits(['close', 'saved']);

  //---------------------------------------------------
  //
  //  Data Model
  //
  //---------------------------------------------------
  const store = useStore();
  const actions = ref(store.actions);
  const host = ref<string>(store.server.host);
  const port = ref<number>(store.server.port);
  // const value = ref();

  //---------------------------------------------------
  //
  //  Computed Properties
  //
  //---------------------------------------------------
  const overlayUrl = computed(() => {
    return `${window.location.origin}/overlay?host=${host.value}&port=${port.value}`;
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
  onMounted(() => {
    // something
  });
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
  async function handleImport() {
    const config: AppConfig | null = await uploadJson();
    if (config) {
      store.update(config);
      host.value = config.server.host;
      port.value = parseInt(config.server.port, 10);
      actions.value = config.actions;
    }
  }

  function handleExport() {
    const config = store.config;
    downloadJson(config);
  }

  function handleSave() {
    store.update({
      server: {
        host: host.value,
        port: port.value,
      },
      actions: actions.value,
    });
    emit('saved');
  }

  //---------------------------------------------------
  //
  //  Expose
  //
  //---------------------------------------------------
  // defineExpose({});
</script>

<template>
  <Teleport to="body">
    <div id="modal">
      <div class="underlay" @click="emit('close')" />
      <div class="content">
        <button class="close" @click="emit('close')">&times;</button>
        <h3>Server Settings</h3>
        <div class="group two-thirds">
          <div class="input text">
            <label for="host">Host</label>
            <input id="host" type="text" placeholder="127.0.0.1" v-model="host" />
          </div>
          <div class="input text">
            <label for="port">Port</label>
            <input id="port" type="text" placeholder="5566" v-model="port" />
          </div>
        </div>
        <div class="group">
          <div class="input url">
            <label>OBS Overlay URL:</label>
            <a :href="overlayUrl" target="_blank">{{ overlayUrl }}</a>
          </div>
        </div>
        <h3>Actions</h3>
        <div class="group">
          <div class="input code-editor">
            <MonacoEditor v-model="actions" />
          </div>
        </div>
        <div class="group actions">
          <div>
            <button class="btn outline" @click="handleImport">Import</button>
            <button class="btn outline" @click="handleExport">Export</button>
          </div>
          <div>
            <button class="btn primary" @click="handleSave">Save</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss">
  @use '@/assets/scss/query';
  @use '@/assets/scss/variables';

  #modal {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    display: flex;
    justify-content: center;
    align-items: center;

    & > .underlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgb(from var(--color-shadow1) r g b / 60%);
    }

    & > .content {
      position: relative;
      z-index: 2;
      min-width: 40vw;
      background: var(--color-bg-secondary);
      padding: calc(var(--baseunit) * 2);
      border-radius: 4px;
      box-shadow: 0 2px 4px black;
      border: 1px solid rgb(from var(--color-border1) r g b / 10%);
      border-bottom: 1px solid rgb(from var(--color-border1) r g b / 25%);

      & > button.close {
        position: absolute;
        right: 0;
        top: 0;
        color: var(--color-accent);
        font-size: 2rem;
        padding: calc(var(--baseunit) * 0.5) var(--baseunit) var(--baseunit) var(--baseunit);
        margin: 0;
        text-shadow: 0 -1px 2px rgb(from var(--color-shadow1) r g b / 100%);
        background: transparent;
        border: 0;
        cursor: pointer;
      }

      & > h3 {
        border-top: 1px solid rgb(from var(--color-bg-primary) r g b / 70%);
        padding: calc(var(--baseunit) * 2) 0 4px 0;
        margin-bottom: calc(var(--baseunit));

        &:first-of-type {
          padding-top: 0;
          border-top: 0;
        }
      }

      & > div.group {
        display: flex;
        gap: calc(var(--baseunit) * 2);
        margin-bottom: calc(var(--baseunit));

        &:last-of-type {
          margin-bottom: 0;
        }

        & > .input {
          & > label {
            display: block;
            font-size: 1.1rem;
            padding-left: 4px;
            margin-bottom: 2px;
            color: rgb(from var(--color-text-primary) r g b / 70%);
          }
          a {
            font-size: 1.2rem;
            display: inline-block;
            text-decoration: none;
            color: var(--color-accent);
            padding: var(--baseunit);
            text-shadow: 0 1px black;
          }

          &.text {
            width: 100%;

            & > input {
              width: 100%;
              height: calc(var(--baseunit) * 4);
              font-family: inherit;
              color: inherit;
              background: var(--color-bg-primary);
              border-radius: 3px;
              border: 1px solid rgb(from var(--color-border1) r g b / 30%);
              outline: 0;
              padding: 0 8px;

              &:focus-within {
                border-color: var(--color-accent);
              }
            }
          }

          &.code-editor {
            width: 100%;
            height: 350px;
          }
        }

        &.actions {
          display: flex;
          justify-content: space-between;
          margin-top: calc(var(--baseunit) * 3);
          gap: calc(var(--baseunit) * 2);

          & > div {
            display: inline-flex;
            gap: var(--baseunit);
          }
        }

        &.two-thirds {
          & > div:first-of-type {
            min-width: 66.66%;
          }
        }
      }
    }
  }
</style>
