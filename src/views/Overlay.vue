<script setup lang="ts">
  //---------------------------------------------------
  //
  //  Imports
  //
  //---------------------------------------------------
  import { StreamerbotClient } from '@streamerbot/client';
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { ChatMessage } from '@/types/interfaces.ts';
  import { useStore } from '@/store.ts';
  import { useRoute } from 'vue-router';

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
  const store = useStore();
  const route = useRoute();
  const message = ref<ChatMessage | null>(null);
  const hide = ref(false);
  let timeout: any = 0;
  let client: StreamerbotClient = new StreamerbotClient({ ...store.server, immediate: false });

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
  onMounted(async () => {
    const { host, port } = route.query;
    if (host && port) {
      client = new StreamerbotClient({
        host: route.query.host as string,
        port: parseInt(route.query.port as string, 10),
        immediate: false,
      });
    }
    await client.connect();
    await client.on('Custom.*', (resp) => {
      const eventName = resp.data.eventName;
      if (eventName === 'Custom.Highlight') {
        clearTimeout(timeout);
        hide.value = false;
        const msg = JSON.parse(resp.data.args.message);
        message.value = { ...msg };
      } else if (eventName === 'Custom.Unhighlight') {
        hide.value = true;
        timeout = setTimeout(() => {
          message.value = null;
          hide.value = false;
        }, 1050);
      }
    });
  });
  // onBeforeUpdate(() => {});
  // onUpdated(() => {});
  // onActivated(() => {});
  // onDeactivated(() => {});
  onBeforeUnmount(() => {
    client.disconnect();
  });
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
  <div id="overlay">
    <div v-if="message" :class="{ hide }">
      <img v-if="message.image" :src="message.image" :alt="message.username" />
      <span v-else class="fallback">{{ message.firstletter }}</span>
      <div>
        <div>
          <span class="username">{{ message.username }}:</span>
          <span class="content" v-html="message.message" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @use '@/assets/scss/query';
  @use '@/assets/scss/variables';

  @keyframes gradient-animation {
    0% {
      background-position: 0 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 125% 50%;
    }
  }

  @keyframes show-mask {
    from {
      clip-path: polygon(0% 0%, 0 0%, 0 150%, 0% 150%);
    }
    to {
      clip-path: polygon(0% 0%, 100% 0%, 100% 150%, 0% 150%);
    }
  }

  @keyframes show-cursor {
    0% {
      left: 0;
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      left: calc(100% - 20px);
      opacity: 0;
    }
  }

  #overlay {
    display: block;
    height: 100vh;
    width: 100vw;
    max-height: 100%;
    max-width: 100%;
    overflow: hidden;

    & > div {
      display: inline-flex;
      position: absolute;
      bottom: 32px;
      left: 24px;
      filter: drop-shadow(8px 10px 4px rgba(0, 0, 0, 0.6));
      clip-path: polygon(0% 0%, 0 0%, 0 150%, 0% 150%);
      animation: show-mask 1.5s ease forwards;
      opacity: 1;
      transform: translate(0, 0);

      &.hide {
        opacity: 0;
        transform: translate(0, 100%);
        transition:
          opacity 0.4s linear,
          transform 0.4s ease-in;
      }

      &:after {
        position: absolute;
        content: '';
        width: 4px;
        height: 100%;
        border-radius: 4px;
        background: white;
        z-index: 100;
        left: 0;
        animation: show-cursor 1.4s 0.02s ease forwards;
      }

      & > img {
        top: 2px;
        left: 2px;
        position: relative;
        aspect-ratio: 1;
        border-radius: 116px;
        min-width: 116px;
        min-height: 116px;
        width: 116px;
        height: 116px;
        overflow: hidden;
        z-index: 3;
      }

      & > span.fallback {
        display: flex;
        justify-content: center;
        align-items: center;
        top: 2px;
        left: 2px;
        position: relative;
        aspect-ratio: 1;
        border-radius: 116px;
        min-width: 116px;
        min-height: 116px;
        width: 116px;
        height: 116px;
        z-index: 3;
        background: linear-gradient(-45deg, transparent, rgb(255 255 255 / 10%));
        font-weight: 500;
        line-height: 1.8;
        font-size: 5rem;
      }

      & > div {
        top: 0;
        left: -56px;
        padding: 16px 24px 16px 74px;
        position: relative;
        border: 2px solid transparent;
        color: white;
        font-size: 1.3rem;
        line-height: 1.4;
        word-wrap: break-word;
        word-break: break-word;
        height: 120px;
        max-width: 45vw;
        max-height: 120px;
        width: auto;
        z-index: 2;
        display: flex;
        justify-content: flex-start;
        align-items: center;

        &:before {
          position: absolute;
          content: '';
          background: linear-gradient(
            90deg,
            var(--color-overlay-gradient1),
            var(--color-overlay-gradient2),
            var(--color-overlay-gradient1)
          );
          background-size: 400% 100%;
          animation: gradient-animation 4s linear infinite;
          top: -2px;
          left: -62px;
          width: calc(100% + 64px);
          height: calc(100% + 4px);
          z-index: -1;
          border-radius: 120px 12px 12px 120px;
        }

        &:after {
          position: absolute;
          content: '';
          background: rgb(0 0 0 / 90%);
          top: 0;
          left: -60px;
          width: calc(100% + 60px);
          height: 100%;
          z-index: -1;
          border-radius: 120px 12px 12px 120px;
        }

        & > div {
          position: relative;
          top: 2px;
          width: 100%;
          max-height: inherit;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          line-clamp: 3;
          text-overflow: ellipsis;
          overflow: hidden;

          & > span.username {
            border-radius: 6px;
            border: 1px solid black;
            padding: 3px 6px;
            background-color: rgb(255, 255, 255, 0.65);
            color: black;
            font-weight: 600;
            font-size: 2.4rem;
            margin-right: 12px;
          }

          & > span.content {
            font-size: 2.4rem;
            line-height: 1.4;
            & > img {
              width: 24px;
              height: 24px;
              margin: -1px 2px 1px;
              vertical-align: middle;
            }
          }
        }
      }
    }
  }
</style>
