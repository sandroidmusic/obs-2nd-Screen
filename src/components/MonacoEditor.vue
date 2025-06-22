<script setup lang="ts">
  /* eslint-disable */
  // @ts-nocheck
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { loadExternalFile } from '@/utils/Helpers.ts';

  // Props
  const props = defineProps({
    modelValue: String,
    language: {
      type: String,
      default: 'json',
    },
    theme: {
      type: String,
      default: 'vs-dark',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  });

  // Emits
  const emit = defineEmits(['update:modelValue', 'editor-mounted', 'editor-changed']);

  // Refs
  const editorContainer = ref(null);
  let editorInstance = null;
  let monaco = null;

  const MONACO_CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.49.0/min/vs';
  const MONACO_LOADER_URL = `${MONACO_CDN_BASE}/loader.min.js`;

  /**
   * Loads the Monaco Editor loader script and configures it.
   */
  async function loadMonacoEditor() {
    try {
      // Load the Monaco loader script
      await loadExternalFile(MONACO_LOADER_URL, 'script');

      // Ensure 'require' is available and configure it for Monaco
      if (window.require?.config) {
        window.require.config({ paths: { vs: MONACO_CDN_BASE } });

        // Load the main Monaco editor bundle
        loadExternalFile(`${MONACO_CDN_BASE}/editor/editor.main.css`, 'stylesheet').catch((e) =>
          console.warn('Could not load Monaco Editor stylesheet, editor might look off:', e),
        );

        return new Promise((resolve, reject) => {
          // noinspection TypeScriptUnresolvedReference
          window.require(
            ['vs/editor/editor.main'],
            () => {
              monaco = window.monaco;
              resolve();
            },
            reject,
          );
        });
      } else {
        throw new Error('Monaco loader (require.js) not found or not configured.');
      }
    } catch (error) {
      console.error('Failed to load Monaco Editor:', error);
      throw error; // Re-throw to propagate the error
    }
  }

  /**
   * Initializes the Monaco Editor instance.
   */
  function initMonacoEditor() {
    if (!monaco || !editorContainer.value) {
      console.warn('Monaco not loaded or container not ready.');
      return;
    }

    // Dispose existing editor if any (e.g., component re-mounts or hot-reload)
    if (editorInstance) {
      editorInstance.dispose();
    }

    editorInstance = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language,
      theme: props.theme,
      lineNumbers: 'off',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      renderLineHighlightOnlyWhenFocus: true,
      automaticLayout: true, // Automatically resize editor with container
      minimap: {
        enabled: false,
      },
      ...props.options,
    });

    editorInstance.onDidChangeModelContent(() => {
      const newValue = editorInstance.getValue();
      if (newValue !== props.modelValue) {
        emit('update:modelValue', newValue);
        emit('editor-changed', newValue);
      }
    });

    emit('editor-mounted', editorInstance, monaco);
  }

  // Lifecycle Hooks
  onMounted(async () => {
    try {
      await loadMonacoEditor();
      initMonacoEditor();
    } catch (error) {
      // Handle error (e.g., display an error message to the user)
      console.error('Monaco Editor failed to initialize completely.', error);
    }
  });

  onUnmounted(() => {
    if (editorInstance) {
      editorInstance.dispose(); // Important for memory management
      editorInstance = null;
    }
    monaco = null; // Clear reference
  });

  // Watch for changes in props and update editor
  watch(
    () => props.modelValue,
    (newValue) => {
      if (editorInstance && newValue !== editorInstance.getValue()) {
        editorInstance.setValue(newValue);
      }
    },
  );

  watch(
    () => props.language,
    (newLang) => {
      if (editorInstance) {
        monaco.editor.setModelLanguage(editorInstance.getModel(), newLang);
      }
    },
  );

  watch(
    () => props.theme,
    (newTheme) => {
      if (monaco) {
        monaco.editor.setTheme(newTheme);
      }
    },
  );

  // Watch for changes in options (deep watch if options can change dynamically)
  // Be careful with deep watching large objects, might impact performance
  watch(
    () => props.options,
    (newOptions) => {
      if (editorInstance) {
        editorInstance.updateOptions(newOptions);
      }
    },
    { deep: true },
  );
</script>

<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<style lang="scss">
  @use '@/assets/scss/query';
  @use '@/assets/scss/variables';

  .monaco-editor-container {
    width: 100%;
    height: 100%;
    min-height: 200px;
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgb(from var(--color-border1) r g b / 30%);
    &:focus-within {
      border-color: var(--color-accent);
    }
  }

  .monaco-editor,
  .monaco-diff-editor,
  .monaco-component {
    --vscode-editor-background: var(--color-bg-primary) !important;
    .margin-view-overlays {
      background: rgb(from var(--color-bg-primary) r g b / 70%);
    }
  }
</style>
