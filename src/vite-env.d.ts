/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' | '1' force on; 'false' | '0' force off. Unset: on in dev, off in prod build. */
  readonly VITE_DEVICE_PREVIEW_FRAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
