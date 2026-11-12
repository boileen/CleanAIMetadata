/**
 * Client-Side Google Drive Picker & Downloader
 *
 * 100% In-Browser:
 * 1. Lazily loads Google Identity Services (GIS) and Google Picker scripts on demand.
 * 2. Authenticates via OAuth 2.0 with minimal scope: 'https://www.googleapis.com/auth/drive.file'
 *    (Allows access ONLY to files the user explicitly chooses in the picker).
 * 3. Fetches the binary file content directly in the browser via Google Drive v3 API alt=media.
 * 4. Converts the response blob into standard browser `File` objects to hand over to our
 *    lossless client-side inspection & stripping pipeline.
 *
 * Zero server uploads: Nothing passes through an intermediary server.
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_APP_ID = import.meta.env.VITE_GOOGLE_APP_ID || '';

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const GIS_URL = 'https://accounts.google.com/gsi/client';
const GAPI_URL = 'https://apis.google.com/js/api.js';

let gisLoaded = false;
let gapiLoaded = false;
let tokenClient = null;
let currentAccessToken = null;

export function isGoogleDriveConfigured() {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_API_KEY);
}

/**
 * Dynamically load an external script if not already present.
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * Ensure both GIS and GAPI (Picker) are loaded and initialized.
 */
async function initializeGoogleApis() {
  if (!isGoogleDriveConfigured()) {
    throw new Error('Google Drive integration is not configured. Missing client ID or API key.');
  }

  const loads = [];
  if (!gisLoaded) {
    loads.push(loadScript(GIS_URL).then(() => { gisLoaded = true; }));
  }
  if (!gapiLoaded) {
    loads.push(
      loadScript(GAPI_URL).then(() => {
        return new Promise((resolve, reject) => {
          window.gapi.load('picker', {
            callback: () => {
              gapiLoaded = true;
              resolve();
            },
            onerror: () => reject(new Error('Failed to load Google Picker API module.')),
          });
        });
      })
    );
  }

  await Promise.all(loads);

  if (!tokenClient && window.google?.accounts?.oauth2) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: () => {}, // overridden per pick request
    });
  }
}

/**
 * Request an OAuth 2.0 access token via Google Identity Services popup.
 */
function requestAccessToken() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google OAuth Token Client not initialized.'));
      return;
    }

    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(response.error_description || response.error));
        return;
      }
      currentAccessToken = response.access_token;
      resolve(currentAccessToken);
    };

    // Prompt user to select/authorize Google account
    tokenClient.requestAccessToken({ prompt: '' });
  });
}

/**
 * Download a file's binary stream directly from Google Drive v3 alt=media
 * into a browser File object.
 */
async function downloadDriveFile(fileMeta, accessToken, maxSize) {
  const { id, name, mimeType } = fileMeta;
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Google Drive authentication expired. Please try selecting the file again.');
    }
    throw new Error(`Failed to fetch file from Google Drive (${response.status} ${response.statusText}).`);
  }

  const blob = await response.blob();

  // Picker does not always populate sizeBytes, so enforce the cap on the real
  // byte length as well before handing the file to the queue.
  if (maxSize && blob.size > maxSize) {
    throw new Error(
      `"${name}" is ${Math.round(blob.size / (1024 * 1024))}MB after download, which exceeds the ${Math.round(
        maxSize / (1024 * 1024),
      )}MB limit.`,
    );
  }

  const inferredType = blob.type || mimeType || 'image/jpeg';
  return new File([blob], name, { type: inferredType });
}

/**
 * Open the Google Picker dialog to select images from Drive.
 * Returns an array of File objects.
 *
 * @param {Object} options
 * @param {boolean} options.multiple - Allow selecting multiple files
 * @param {number} options.maxSize - Maximum size in bytes per file (optional)
 * @param {number} options.maxFiles - Maximum number of files this pick may return
 * @param {Function} options.onStatus - Callback for status updates (e.g. 'authenticating', 'downloading')
 * @returns {Promise<File[]>}
 */
export async function pickImagesFromGoogleDrive({
  multiple = false,
  maxSize = 100 * 1024 * 1024,
  maxFiles = Infinity,
  onStatus = () => {},
} = {}) {
  onStatus('initializing');
  await initializeGoogleApis();

  onStatus('authenticating');
  const token = await requestAccessToken();

  return new Promise((resolve, reject) => {
    onStatus('selecting');

    try {
      // Allowed image mime types in picker
      const imageMimeFilter = 'image/jpeg,image/png,image/webp,image/tiff,image/heic,image/heif,image/avif';

      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
        .setMimeTypes(imageMimeFilter)
        .setMode(window.google.picker.DocsViewMode.GRID);

      const builder = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .addView(view)
        .setOAuthToken(token)
        .setDeveloperKey(GOOGLE_API_KEY)
        .setCallback(async (data) => {
          if (data.action === window.google.picker.Action.CANCEL) {
            onStatus('cancelled');
            resolve([]);
            return;
          }

          if (data.action === window.google.picker.Action.PICKED) {
            const docs = data[window.google.picker.Response.DOCUMENTS] || [];
            if (!docs.length) {
              resolve([]);
              return;
            }

            // Refuse the batch before downloading anything we cannot queue.
            if (docs.length > maxFiles) {
              reject(
                new Error(
                  maxFiles <= 0
                    ? 'The queue is full. Remove a file before adding another one from Drive.'
                    : `You selected ${docs.length} files, but only ${maxFiles} more can be added to this batch.`,
                ),
              );
              return;
            }

            try {
              onStatus('downloading');
              const files = [];

              for (const doc of docs) {
                const docSize = doc.sizeBytes ? parseInt(doc.sizeBytes, 10) : 0;
                if (maxSize && docSize > maxSize) {
                  throw new Error(`"${doc.name}" exceeds the maximum allowed file size of ${Math.round(maxSize / (1024 * 1024))}MB.`);
                }

                const file = await downloadDriveFile({
                  id: doc.id,
                  name: doc.name,
                  mimeType: doc.mimeType,
                }, token, maxSize);

                files.push(file);
              }

              onStatus('complete');
              resolve(files);
            } catch (dlErr) {
              reject(dlErr);
            }
          }
        });

      if (multiple) {
        builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
      }

      if (GOOGLE_APP_ID) {
        builder.setAppId(GOOGLE_APP_ID);
      }

      const picker = builder.build();
      picker.setVisible(true);
    } catch (err) {
      reject(err);
    }
  });
}
