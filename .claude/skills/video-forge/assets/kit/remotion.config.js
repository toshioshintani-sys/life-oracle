import {Config} from '@remotion/cli/config';
import {browserExecutable} from './scripts/env.mjs';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swangle');
if (browserExecutable) {
  Config.setBrowserExecutable(browserExecutable);
}
