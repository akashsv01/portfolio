/** Synchronous check — safe to call only in the browser after mount. */
export function canCreateWebGLContext(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2", { alpha: true });
    if (gl2) return true;
    const gl =
      canvas.getContext("webgl", { alpha: true }) ||
      canvas.getContext("experimental-webgl", { alpha: true });
    return !!gl;
  } catch {
    return false;
  }
}
