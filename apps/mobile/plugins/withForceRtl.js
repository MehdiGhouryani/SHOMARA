/**
 * Forces RTL at the NATIVE level before React Native starts, so the very first
 * launch is already right-to-left on any device language (I18nManager.forceRTL
 * from JS only applies from the next start). Persian-only app (DEC: SoT §26).
 */
const { withMainApplication } = require('@expo/config-plugins');

const IMPORT = 'import com.facebook.react.modules.i18nmanager.I18nUtil';
const CALLS = `    I18nUtil.getInstance().allowRTL(this, true)\n    I18nUtil.getInstance().forceRTL(this, true)\n`;

module.exports = function withForceRtl(config) {
  return withMainApplication(config, (cfg) => {
    let src = cfg.modResults.contents;
    if (cfg.modResults.language !== 'kt') {
      throw new Error('withForceRtl: expected a Kotlin MainApplication');
    }
    if (!src.includes('I18nUtil.getInstance().forceRTL')) {
      if (!src.includes(IMPORT)) src = src.replace(/(^package .*\n)/m, `$1\n${IMPORT}\n`);
      const re = /(override fun onCreate\(\) \{\n\s*super\.onCreate\(\)\n)/;
      if (!re.test(src)) throw new Error('withForceRtl: could not find MainApplication.onCreate()');
      src = src.replace(re, `$1${CALLS}`);
    }
    cfg.modResults.contents = src;
    return cfg;
  });
};
