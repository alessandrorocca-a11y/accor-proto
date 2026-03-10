/**
 * Accor UI Icons — icon set source and catalog
 *
 * Source: Figma "💎 Icons Library" (Accor Live Limitless)
 * Use this file as the single reference for the design system icon set.
 */

/** Figma Icons Library — design source */
export const FIGMA_ICONS_SOURCE = {
  url: 'https://www.figma.com/design/cjpLTnp3QBCYGJV8UJFJH0OG/%F0%9F%92%A0-Icons-Library',
  fileKey: 'cjpLTnp3QBCYGJV8UJFJH0OG',
  /** UI Icons artboard */
  artboardNodeId: '9069:994',
  /** Header "all-icon" decorative asset */
  allIconNodeId: '9069:1056',
  /** Header title icon */
  headerIconNodeId: '9069:1075',
} as const;

/** Known icon names from the Accor UI Icons library. Extend as you add icons from Figma. */
export const ACCOR_ICON_NAMES = [
  // Add icon names here as you export them from the Figma library, e.g.:
  // 'arrow-right', 'chevron-down', 'close', 'menu', 'search', 'user', ...
] as const;

export type AccorIconName = (typeof ACCOR_ICON_NAMES)[number];

/** Optional: map icon name to Figma node ID for design-to-code sync (Code Connect). */
export const ACCOR_ICON_NODE_IDS: Partial<Record<AccorIconName, string>> = {
  // e.g. 'close': '9069:1234',
};
