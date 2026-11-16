import {Config} from '@remotion/cli/config';
import fs from 'node:fs';
// On a Mac (or any machine with a GPU) Chrome renders WebGL on the graphics card.
// In the cloud container there is no GPU, so it falls back to SwiftShader.
const CLOUD_CHROME = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (process.platform === 'linux' && fs.existsSync(CLOUD_CHROME)) {
  Config.setChromiumOpenGlRenderer('swangle');
  Config.setBrowserExecutable(CLOUD_CHROME);
} else {
  Config.setChromiumOpenGlRenderer('angle');
}
Config.setDelayRenderTimeoutInMilliseconds(600000);
Config.setVideoImageFormat('png');
