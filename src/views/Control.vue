<script lang="ts">
  import SVGHighlightOn from '@/assets/svgs/icon-highlight.svg';
  import SVGHighlightOff from '@/assets/svgs/icon-highlight-off.svg';
  import SVGFullscreen from '@/assets/svgs/icon-fullscreen.svg';
  import SVGSettings from '@/assets/svgs/icon-settings.svg';
  import SVGStats from '@/assets/svgs/icon-stats.svg';
  import SVGLike from '@/assets/svgs/icon-like.svg';
  import SVGDislike from '@/assets/svgs/icon-dislike.svg';
  import SVGViewers from '@/assets/svgs/icon-viewers.svg';
  import SVGViews from '@/assets/svgs/icon-views.svg';

  export default {
    components: {
      SVGHighlightOn,
      SVGHighlightOff,
      SVGFullscreen,
      SVGSettings,
      SVGStats,
      SVGLike,
      SVGDislike,
      SVGViewers,
      SVGViews,
    },
  };
</script>
<script setup lang="ts">
  //---------------------------------------------------
  //
  //  Imports
  //
  //---------------------------------------------------
  import { useStore } from '@/store.ts';
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { Action, ChatMessage, YoutubeMessage } from '@/types/interfaces.ts';
  import { StreamerbotClient } from '@streamerbot/client';
  import ToggleButton from '@/components/ToggleButton.vue';
  import { Components, Actions } from '@/objects/Constants.ts';
  import { delay, getBase64Image, parseActions } from '@/utils/Helpers.ts';
  import Settings from '@/components/Settings.vue';

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
  let client: StreamerbotClient;
  const actions = ref<Action[]>([]);
  const messages = ref<ChatMessage[]>([]);
  const chatMessage = ref('');
  const stats = ref({ like: 0, dislike: 0, views: 0, viewers: 0 });
  const settingsVisible = ref(false);
  const container = ref<HTMLElement | null>();
  const prevent = { eventloop: false };

  //---------------------------------------------------
  //
  //  Computed Properties
  //
  //---------------------------------------------------
  // const screenSize = computed(() => { return null; });

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
    await connect();
    /*
    // Create fake ChatMessages
    const message = {
      message: 'This is a test message. This is a test message',
      username: 'Testuser',
      firstletter: 'S',
      time: '00:00',
    } as ChatMessage;
    const msgs = messages.value as ChatMessage[];
    for (let i = 0; i < 50; i += 1) {
      msgs.unshift(message);
    }
    messages.value = msgs;
    */
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
  async function connect() {
    client = new StreamerbotClient({ ...store.server, immediate: false });
    await client.connect();
    await delay(80);

    const activeScene = await currentScene();

    const iactions: Action[] = [];
    const rawActions: Action[] = parseActions(store.actions);
    for (let i = 0, n = rawActions.length; i < n; i += 1) {
      const action = rawActions[i];
      if (action.action === Actions.SceneChange && activeScene === action.value) {
        action.active = true;
      } else if (action.action === Actions.AudioToggleMute) {
        const isMuted = await isAudioMuted(action.value);
        action.active = !isMuted;
      }
      iactions.push(action);
    }
    actions.value = iactions;

    await client.on('YouTube.Message', (p) => handleYoutubeMessage(p.data));
    // await client.on('YouTube.SuperChat', (p) => handleYoutubeMessage(p.data));
    // await client.on('YouTube.SuperSticker', (p) => handleYoutubeMessage(p.data));
    await client.on('YouTube.StatisticsUpdated', (p) => handleYoutubeStatistics(p.data));
    await client.on('Custom.*', (p) => handleCustomEvent(p.data));
  }

  function toggleSettings() {
    settingsVisible.value = !settingsVisible.value;
  }

  async function updateSettings() {
    await client.disconnect();
    await connect();
  }

  //----------------------------------
  // Audio Methods
  //----------------------------------
  async function toggleAudio(audioSource: string, executeAction: boolean = true) {
    const selectedAction = getActionByValue(audioSource, Actions.AudioToggleMute);
    if (selectedAction) {
      const groupedActions = getActionsByGroup(selectedAction.radiogroup);
      if (groupedActions.length > 0) {
        groupedActions?.forEach((action) => {
          action.active = false;
        });
        selectedAction.active = true;
      } else {
        selectedAction.active = !selectedAction.active;
      }

      if (executeAction) {
        prevent.eventloop = true;
        await client.doAction(Actions.AudioToggleMute, { audioSource });
        await delay(50);
        prevent.eventloop = false;
      }
    }
  }

  async function isAudioMuted(audioSource: string) {
    const resp = await client.doAction(
      Actions.AudioGetMute,
      { obsRawSourceName: audioSource },
      { customEventResponse: true },
    );
    const args = resp?.customEventResponseArgs || {};
    return args['obsRaw.inputMuted'] || false;
  }

  //----------------------------------
  // Scene Methods
  //----------------------------------
  async function currentScene() {
    const resp = await client.doAction(Actions.SceneGetCurrent, {}, { customEventResponse: true });
    return resp?.customEventResponseArgs?.currentScene || null;
  }

  async function changeScene(scene: string, executeAction: boolean = true) {
    const selectedAction = getActionByValue(scene, Actions.SceneChange);
    if (selectedAction) {
      const groupedActions = getActionsByGroup(selectedAction.radiogroup);
      groupedActions?.forEach((action) => {
        action.active = false;
      });

      selectedAction.active = true;

      if (executeAction) {
        prevent.eventloop = true;
        await client.doAction(Actions.SceneChange, { scene });
        await delay(50);
        prevent.eventloop = false;
      }
    }
  }

  //----------------------------------
  // Chat Methods
  //----------------------------------
  async function sendChatMessage() {
    const message = `${chatMessage.value}`;
    await client.doAction(Actions.MessageSend, { message });
    chatMessage.value = '';
  }

  async function highlightMessage(msg: ChatMessage) {
    await client.doAction(Actions.MessageHighlight, {
      message: JSON.stringify(msg),
    });
  }

  async function unhighlight() {
    await client.doAction(Actions.MessageUnhighlight);
  }

  //----------------------------------
  // Helper Methods
  //----------------------------------
  function getActionByValue(value: string | number, action?: string): Action | undefined {
    const iactions = actions.value as Action[];
    if (action) {
      return iactions.find((a) => a.value === value && a.action === action);
    }
    return iactions.find((a) => a.value === value);
  }

  function getActionsByGroup(radiogroup?: string): Action[] {
    if (radiogroup) {
      const iactions = actions.value as Action[];
      return iactions.filter((a) => a.radiogroup === radiogroup);
    }
    return [];
  }

  /*
  function getActionsByAction(action: string): Action[] {
    const iactions = actions.value as Action[];
    return iactions.filter((a) => a.action === action);
  }
  */

  //----------------------------------
  // Event Handlers
  //----------------------------------
  function handleAction(actionIndex: number) {
    const action = actions.value[actionIndex] as Action;
    if (action) {
      switch (action.action) {
        case Actions.SceneChange: {
          changeScene(action.value);
          break;
        }
        case Actions.AudioToggleMute: {
          toggleAudio(action.value);
          break;
        }
        default: {
          console.log('Unhandled action: ', action);
        }
      }
    }
  }

  async function handleYoutubeMessage(data: YoutubeMessage) {
    const { parts, user, publishedAt } = data;
    let message = '';
    (parts || []).forEach((part) => {
      if (part.emoji) {
        message += `<img src="${part.image}" alt="${part.emoji}"/> `;
      } else if (part.text) {
        message += `${part.text} `;
      }
    });

    const date = new Date(publishedAt);
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    let image: any;

    try {
      image = (await getBase64Image(user.profileImageUrl)) || null;
    } catch (error) {
      image = null;
    }

    const out: ChatMessage = {
      message,
      username: user.name,
      firstletter: user.name[0],
      image,
      time,
    };

    const msgs = messages.value as ChatMessage[];
    msgs.unshift(out);
    if (msgs.length > 100) {
      msgs.pop();
    }
    messages.value = msgs;
  }

  function handleYoutubeStatistics(data: any) {
    const { likeCount, dislikeCount, viewCount, concurrentViewers } = data;
    stats.value = {
      like: likeCount,
      dislike: dislikeCount,
      views: viewCount,
      viewers: concurrentViewers,
    };
  }

  function handleCustomEvent(data: any) {
    if (!prevent.eventloop) {
      switch (data.eventName) {
        case 'Custom.AudioToggle': {
          toggleAudio(data.args.audioSource, false);
          break;
        }
        case 'Custom.SceneChange': {
          changeScene(data.args.scene, false);
          break;
        }
        default: {
          // ignore
        }
      }
    }
  }

  function handleFullScreen() {
    if (!document.fullscreenElement && container?.value) {
      container?.value.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  }

  //---------------------------------------------------
  //
  //  Expose
  //
  //---------------------------------------------------
  // defineExpose({});
</script>

<template>
  <div id="control">
    <div ref="container">
      <div class="controls" tabindex="-1">
        <div>
          <template v-for="(action, adx) in actions">
            <ToggleButton
              v-if="action.type === Components.ToggleButton"
              :key="`uic-${adx}`"
              :action="action"
              @action="handleAction(adx)"
            />
          </template>
        </div>
      </div>

      <div class="messages" tabindex="-1">
        <div class="scroll-container">
          <div tabindex="-1" class="message-item" v-for="(msg, idx) in messages" :key="`message-${idx}`">
            <img v-if="msg.image" :src="msg.image" :alt="msg.username" :title="msg.username" />
            <span v-else class="fallback">{{ msg.firstletter }}</span>
            <div class="message">
              <time :datetime="msg.time">{{ msg.time }}</time>
              <span class="username">{{ msg.username }}</span>
              <span class="content" v-html="msg.message" />
            </div>
            <div class="actions">
              <button class="btn outline fit dark" @click="highlightMessage(msg, idx)">
                <SVGHighlightOn />
              </button>
              <button class="btn outline fit dark" @click="unhighlight(idx)">
                <SVGHighlightOff />
              </button>
            </div>
          </div>
        </div>
        <div class="input">
          <input type="text" placeholder="Chat..." v-model="chatMessage" @keyup.enter="sendChatMessage" />
        </div>
      </div>

      <div class="actions">
        <button class="fullscreen" @click="handleFullScreen()"><SVGFullscreen /></button>
        <div class="stats" tabindex="0">
          <SVGStats />
          <div>
            <div>
              <SVGLike /><span>{{ stats.like }}</span>
            </div>
            <div>
              <SVGDislike /><span>{{ stats.dislike }}</span>
            </div>
            <div>
              <SVGViews /><span>{{ stats.views }}</span>
            </div>
            <div>
              <SVGViewers /><span>{{ stats.viewers }}</span>
            </div>
          </div>
        </div>
        <button class="settings" @click="toggleSettings()"><SVGSettings /></button>
      </div>
    </div>
  </div>

  <Settings v-if="settingsVisible" @close="toggleSettings" @saved="updateSettings" />
</template>

<style lang="scss">
  @use '@/assets/scss/query';
  @use '@/assets/scss/variables';

  #control {
    display: flex;
    width: 100%;
    height: 100svh;
    max-height: 100%;
    max-width: 100%;
    justify-content: center;
    align-items: center;

    & > div {
      position: relative;
      display: flex;
      width: inherit;
      height: inherit;
      gap: calc(var(--baseunit) * 2);
      overflow: hidden;
      background: var(--color-bg-primary);

      @include query.mobile {
        flex-direction: column-reverse;
        gap: 0;
      }

      & > .controls {
        width: 65%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        overflow-y: scroll;
        touch-action: pan-y;

        @include query.mobile {
          width: 100%;
          height: 30%;
        }

        & > div {
          width: 100%;
          height: auto;
          max-height: 100%;
          padding: var(--baseunit) var(--baseunit) var(--baseunit) calc(var(--baseunit) * 3);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-column-gap: calc(var(--baseunit) * 2);
          grid-row-gap: calc(var(--baseunit) * 2);
          align-items: end;
          justify-content: center;

          @include query.mobile {
            grid-column-gap: var(--baseunit);
            grid-row-gap: var(--baseunit);
            padding-left: var(--baseunit);
          }
        }
      }

      & > .messages {
        position: relative;
        width: 35%;
        height: 100%;
        overflow: hidden;

        @include query.mobile {
          width: 100%;
          height: 70%;
        }

        & > .input {
          border-left: 1px solid rgb(from var(--color-border1) r g b / 20%);

          @include query.mobile {
            border-left: 0;
          }

          & > input {
            border: 0;
            box-shadow: inset 0 0 4px 0 black;
            padding: 0 8px 2px 8px;
            width: 100%;
            height: 36px;
            font-family: inherit;
            color: inherit;
            background: rgb(from var(--color-bg-secondary) r g b / 30%);
            border-top: 1px solid rgb(from var(--color-border1) r g b / 20%);
            outline: 0;
            border-radius: 0;

            @include query.mobile {
              border-left: 0;
              border-top: 0;
            }
          }
        }

        & > .scroll-container {
          overflow: hidden;
          overflow-y: scroll;
          touch-action: pan-y;
          padding: calc(var(--baseunit) * 4) var(--baseunit) var(--baseunit) var(--baseunit);
          display: flex;
          gap: var(--baseunit);
          width: 100%;
          height: calc(100% - 32px);
          max-height: 100%;
          flex-direction: column-reverse;
          background: var(--color-bg-primary);
          border-left: 1px solid rgb(from var(--color-border1) r g b / 20%);
          box-shadow: -2px 0 25px 0 rgb(from var(--color-shadow1) r g b / 50%);
          scrollbar-color: rgb(from var(--color-border1) r g b / 20%) var(--color-bg-primary);
          scrollbar-width: thin;

          @include query.mobile {
            border-left: none;
            box-shadow: none;
            padding-top: calc(var(--baseunit) * 6);
          }

          & > .message-item {
            position: relative;
            display: flex;
            align-items: flex-start;
            justify-content: flex-start;
            gap: var(--baseunit);
            width: 100%;

            & > img {
              position: relative;
              top: -2px;
              border-radius: 24px;
              width: 24px;
              height: 24px;
              max-width: 24px;
              max-height: 24px;
              min-width: 24px;
              min-height: 24px;
              overflow: hidden;
            }

            & > span.fallback {
              display: flex;
              justify-content: center;
              align-items: center;
              position: relative;
              top: -2px;
              border-radius: 24px;
              width: 24px;
              height: 24px;
              max-width: 24px;
              max-height: 24px;
              min-width: 24px;
              min-height: 24px;
              overflow: hidden;
              background-color: var(--color-profileimg-fallback);
              font-weight: 500;
              content: attr(alt);
            }

            & > div.message {
              font-size: 1.3rem;
              line-height: 1.4;
              word-wrap: break-word;
              word-break: break-word;

              @include query.tablet-xl-landscape {
                font-size: 1.7rem;
              }

              @include query.tablet-landscape {
                font-size: 1.5rem;
              }

              & > time {
                color: white;
                opacity: 0.6;
                margin-right: 6px;
                font-size: 1.1rem;

                @include query.tablet-xl-landscape {
                  font-size: 1.4rem;
                }

                @include query.tablet-landscape {
                  font-size: 1.3rem;
                }
              }

              & > span.username {
                border-radius: 4px;
                border: 1px solid black;
                padding: 2px 2px;
                background-color: #aaa;
                color: black;
                font-weight: 600;
                margin-right: 6px;
              }

              & > span.content {
                & > img {
                  width: 24px;
                  height: 24px;
                  margin: -1px 2px 1px;
                  vertical-align: middle;
                }
              }
            }

            & > div.actions {
              position: absolute;
              top: -9px;
              right: -4px;
              display: none;
              width: 100%;
              height: calc(100% + 12px);
              background: linear-gradient(-90deg, rgb(from var(--color-accent) r g b / 10%) 28%, transparent 70%);
              padding: 8px 4px 8px 0;
              gap: var(--baseunit);
              border-radius: 4px;
              z-index: 2;

              &:after {
                position: absolute;
                content: '';
                top: 0;
                right: 0;
                width: 40%;
                height: 100%;
                background: linear-gradient(-90deg, rgb(0 0 0 / 60%) 28%, transparent 70%) no-repeat;
                z-index: -1;
              }

              & > button {
                font-size: 1.1rem;
                height: 28px;
                width: 28px;
                max-height: 28px;

                & > svg {
                  color: inherit;
                  width: 100%;
                  height: 100%;
                }
              }
            }

            &:hover > div.actions,
            &:focus-within > div.actions {
              display: flex;
              justify-content: flex-end;
              align-items: center;
            }
          }
        }

        &:before {
          position: absolute;
          content: '';
          width: calc(100% - 8px);
          height: 64px;
          background: linear-gradient(0deg, transparent 0%, var(--color-bg-primary) 70%);
          z-index: 2;
          top: 0;
          left: 1px;
          pointer-events: none;

          @include query.mobile {
            left: 0;
            width: 100%;
            height: 80px;
          }
        }

        &:after {
          position: absolute;
          content: '';
          width: calc(100% - 8px);
          height: 12px;
          background: linear-gradient(180deg, transparent, var(--color-bg-primary) 50%);
          z-index: 2;
          bottom: 32px;
          left: 1px;

          @include query.mobile {
            left: 0;
            bottom: 31px;
            width: 100%;
            border-bottom: 1px solid rgb(from var(--color-border1) r g b / 20%);
          }
        }
      }

      & > .actions {
        position: absolute;
        top: 0;
        left: 0;
        padding: var(--baseunit) calc(var(--baseunit) * 2);
        display: flex;
        gap: calc(var(--baseunit) * 2);
        width: 65%;
        justify-content: flex-end;
        z-index: 3;

        & > button,
        div {
          position: relative;
          color: white;
          border: none;
          background: transparent;
          width: 16px;
          height: 16px;
          padding: 0;
          cursor: pointer;

          &.stats {
            & > div {
              position: absolute;
              top: 100%;
              transform: translate(-47%, calc(var(--baseunit) * 3));
              width: auto;
              padding: calc(var(--baseunit) * 2);
              border-radius: 4px;
              display: none;
              gap: calc(var(--baseunit) * 2);
              background: var(--color-bg-secondary);
              box-shadow: 0 2px 4px black;
              border: 1px solid rgb(from var(--color-border1) r g b / 10%);
              border-bottom: 1px solid rgb(from var(--color-border1) r g b / 25%);

              &:before {
                content: '';
                position: absolute;
                display: block;
                width: 0;
                left: 50%;
                top: 0;
                border: 10px solid transparent;
                border-top: 0;
                border-bottom: 10px solid var(--color-bg-secondary);
                transform: translate(-50%, calc(-100%));
              }

              & > div {
                display: inline-flex;
                width: auto;
                gap: 8px;

                svg {
                  min-width: 16px;
                  width: 16px;
                  height: 16px;
                  color: white;
                }

                & > span {
                  color: rgb(from var(--color-text-primary) r g b / 100%);
                }
              }
            }
            &:focus-within > div {
              display: flex;
              justify-content: center;
              align-items: center;
            }
          }
        }
      }
    }
  }
</style>
