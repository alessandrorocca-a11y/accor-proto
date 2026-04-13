import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { DevicePreviewBottomChromeTargetContext } from '@/context/DevicePreviewBottomChromeContext';
import { DevicePreviewScrollContainerContext } from '@/context/DevicePreviewScrollContainerContext';
import { parseHashParams } from '@/utils/hashRoute';
import { DevicePreviewIOSChrome } from './DevicePreviewIOSChrome';
import './DevicePreviewFrame.css';

const HTML_CLASS = 'device-preview-frame-active';

/** Visible OLED area (logical points) — iPhone 16 class 6.1". */
export const DEVICE_SCREEN_WIDTH = 393;
export const DEVICE_SCREEN_HEIGHT = 852;

/** Black chassis bezel padding around the glass. */
export const DEVICE_BEZEL_X = 12;
export const DEVICE_BEZEL_Y = 13;

export const DEVICE_OUTER_WIDTH = DEVICE_SCREEN_WIDTH + DEVICE_BEZEL_X * 2;
export const DEVICE_OUTER_HEIGHT = DEVICE_SCREEN_HEIGHT + DEVICE_BEZEL_Y * 2;

/** Inner display corner radius (approx). */
export const DEVICE_SCREEN_CORNER_RADIUS = 50;

const CANVAS_PAD = 48;

/** Reserve space under Dynamic Island + status row (matches CSS). */
export const DEVICE_STATUS_BAR_HEIGHT = 54;

function hashShouldUnframe(hash: string): boolean {
  const { basePath } = parseHashParams(hash);
  return basePath === '#demo' || basePath.startsWith('#email/');
}

type DevicePreviewFrameProps = {
  children: ReactNode;
};

export function DevicePreviewFrame({ children }: DevicePreviewFrameProps) {
  const [hash, setHash] = useState(() => window.location.hash);
  const [scale, setScale] = useState(1);
  const [deviceScrollEl, setDeviceScrollEl] = useState<HTMLDivElement | null>(null);
  const [bottomChromeTarget, setBottomChromeTarget] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const updateScale = useCallback(() => {
    const pw = Math.max(0, window.innerWidth - CANVAS_PAD);
    const ph = Math.max(0, window.innerHeight - CANVAS_PAD);
    setScale(Math.min(1, pw / DEVICE_OUTER_WIDTH, ph / DEVICE_OUTER_HEIGHT));
  }, []);

  useLayoutEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  const unframed = hashShouldUnframe(hash);

  useEffect(() => {
    if (unframed) {
      document.documentElement.classList.remove(HTML_CLASS);
      return () => document.documentElement.classList.remove(HTML_CLASS);
    }
    document.documentElement.classList.add(HTML_CLASS);
    return () => document.documentElement.classList.remove(HTML_CLASS);
  }, [unframed]);

  if (unframed) {
    return <>{children}</>;
  }

  const canvasW = DEVICE_OUTER_WIDTH * scale;
  const canvasH = DEVICE_OUTER_HEIGHT * scale;

  return (
    <DevicePreviewScrollContainerContext.Provider value={deviceScrollEl}>
      <DevicePreviewBottomChromeTargetContext.Provider value={bottomChromeTarget}>
        <div
          className="device-preview-frame"
          data-device-preview="iphone-16"
          style={
            {
              '--device-screen-w': `${DEVICE_SCREEN_WIDTH}px`,
              '--device-screen-h': `${DEVICE_SCREEN_HEIGHT}px`,
              '--device-outer-w': `${DEVICE_OUTER_WIDTH}px`,
              '--device-outer-h': `${DEVICE_OUTER_HEIGHT}px`,
              '--device-bezel-x': `${DEVICE_BEZEL_X}px`,
              '--device-bezel-y': `${DEVICE_BEZEL_Y}px`,
              '--device-screen-radius': `${DEVICE_SCREEN_CORNER_RADIUS}px`,
              '--device-preview-scale': String(scale),
            } as React.CSSProperties
          }
        >
          <div className="device-preview-frame__canvas" style={{ width: canvasW, height: canvasH }}>
            <div
              className="device-preview-frame__phone"
              style={{
                width: DEVICE_OUTER_WIDTH,
                height: DEVICE_OUTER_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <div className="device-preview-frame__device-shell">
                <span className="device-preview-frame__hw-btn device-preview-frame__hw-btn--mute" aria-hidden />
                <div className="device-preview-frame__screen">
                  <DevicePreviewIOSChrome />
                  <div ref={setDeviceScrollEl} className="device-preview-frame__viewport">
                    <div className="device-preview-frame__content">{children}</div>
                  </div>
                  <div ref={setBottomChromeTarget} className="device-preview-frame__bottom-chrome-slot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DevicePreviewBottomChromeTargetContext.Provider>
    </DevicePreviewScrollContainerContext.Provider>
  );
}

/** @deprecated Use DEVICE_SCREEN_WIDTH */
export const DEVICE_PREVIEW_WIDTH = DEVICE_SCREEN_WIDTH;
/** @deprecated Use DEVICE_SCREEN_HEIGHT */
export const DEVICE_PREVIEW_HEIGHT = DEVICE_SCREEN_HEIGHT;
/** @deprecated Use DEVICE_SCREEN_CORNER_RADIUS */
export const DEVICE_PREVIEW_CORNER_RADIUS = DEVICE_SCREEN_CORNER_RADIUS;
