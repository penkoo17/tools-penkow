export function collectBrowserData() {
  const p = {};
  try {
    p.ua = navigator.userAgent;
    p.lang = navigator.language;
    p.langs = navigator.languages;
    p.tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    p.screen = `${screen.width}x${screen.height}`;
    p.window = `${innerWidth}x${innerHeight}`;
    p.colorDepth = screen.colorDepth;
    p.deviceMemory = navigator.deviceMemory || null;
    p.hardwareConcurrency = navigator.hardwareConcurrency || null;
    p.touchPoints = navigator.maxTouchPoints;
    p.platform = navigator.platform;
    p.cookieEnabled = navigator.cookieEnabled;
    p.onLine = navigator.onLine;

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fp', 2, 2);
    p.canvasHash = c.toDataURL().slice(-32);

    const gl = document.createElement('canvas').getContext('webgl');
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      p.webglVendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL);
      p.webglRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    }
  } catch (e) {}
  return p;
}