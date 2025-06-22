import { Action, AppConfig } from '@/types/interfaces.ts';
import { Actions, Components } from '@/objects/Constants.ts';

//----------------------------------
// Simple Delay
//----------------------------------
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseActions(strActions: string): Action[] {
  const arr = JSON.parse(strActions);
  const validComponents = Object.keys(Components).map((key) => `Components.${key}`);
  const validActions = Object.keys(Actions).map((key) => `Actions.${key}`);
  const actions: Action[] = [];
  arr.forEach((o) => {
    if (validComponents.includes(o.type) && validActions.includes(o.action)) {
      const componentKey = o.type.replace('Components.', '');
      const actionKey = o.action.replace('Actions.', '');
      actions.push({
        ...o,
        type: Components[componentKey],
        action: Actions[actionKey],
        active: false,
      });
    }
  });
  return actions;
}

//----------------------------------
// Image to Baset64
//----------------------------------
const imageCache = {};
export async function getBase64Image(imageUrl?: string) {
  return new Promise(async (resolve, reject) => {
    if (!imageUrl) {
      return reject();
    }

    if (imageCache[imageUrl]) {
      resolve(imageCache[imageUrl]);
    }

    try {
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (!response.ok) {
        return reject();
      }
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          imageCache[imageUrl] = reader.result;
          resolve(reader.result);
        } else {
          reject();
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        return reject();
      };

      reader.readAsDataURL(blob);
    } catch (error: unknown) {
      console.error('Error in getBase64Image:', error);
      return reject();
    }
  });
}

//----------------------------------
// Load External JS/CSS
//----------------------------------
const _loadedFiles = {};
export function loadExternalFile(url, type) {
  if (!url || !type) {
    return Promise.reject(new Error('URL and type are required.'));
  }

  const cacheKey = url;
  if (_loadedFiles[cacheKey]) {
    return _loadedFiles[cacheKey] instanceof Promise ? _loadedFiles[cacheKey] : Promise.resolve();
  }

  let element;
  const head = document.head || document.getElementsByTagName('head')[0];
  if (type === 'script') {
    element = document.createElement('script');
    element.type = 'text/javascript';
    element.src = url;
    element.async = true;
  } else if (type === 'stylesheet') {
    element = document.createElement('link');
    element.rel = 'stylesheet';
    element.href = url;
  } else {
    return Promise.reject(new Error('Invalid type specified. Use "script" or "stylesheet".'));
  }

  const loadPromise = new Promise((resolve, reject) => {
    element.onload = () => {
      _loadedFiles[cacheKey] = true;
      resolve('loaded');
    };

    element.onerror = (e) => {
      console.error(`Error loading ${type}: ${url}`, e);
      delete _loadedFiles[cacheKey];
      reject(new Error(`Failed to load ${type}: ${url}`));
    };
  });

  _loadedFiles[cacheKey] = loadPromise;
  head.appendChild(element);
  return loadPromise;
}

//----------------------------------
// Request File
//----------------------------------
export function uploadJson(): Promise<AppConfig | null> {
  return new Promise((resolve, reject) => {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('input', (evt) => {
      const target = evt?.target as HTMLInputElement;
      const file = target && target.files ? target.files[0] : null;
      if (!file) {
        return;
      }

      if (file.type !== 'application/json') {
        alert('Please select a valid JSON file.');
        reject(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt: ProgressEvent<FileReader>) => {
        try {
          const jsonContent = evt.target?.result as string;
          if (jsonContent) {
            const data = JSON.parse(jsonContent);
            resolve(data);
          }
        } catch (err: any) {
          const msg = `Error parsing JSON file. Please ensure it's valid JSON. Error: ${err.message}`;
          alert(msg);
          reject(null);
        }
      };

      reader.onerror = () => {
        alert('Error reading file. Please try again.');
        reject(null);
      };

      reader.readAsText(file);
    });
    input.click();
  });
}

//----------------------------------
// Download JSON File
//----------------------------------
export function downloadJson(data, filename = 'obs-2ndscreen-config.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}
