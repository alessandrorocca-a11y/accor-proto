# Bottom iOS navbar (prototype) — reference only

**Status:** Archived for future work. **Not used in the app** until explicitly wired in.

## Human-readable name

**Bottom iOS navbar** — Safari-style toolbar row in the mobile prototype shell (back / forward / share / bookmarks / tabs).

## React

- **Component:** `IosSystemBar` (see `MobilePrototypeShell` when that feature exists on the branch).

## DOM (canonical class names)

```
div#root
  > div.mobile-prototype-shell.mobile-prototype-shell--ios
  > div.mobile-prototype-shell__device.mobile-prototype-shell__device--full-bleed
  > div.mobile-prototype-shell__ios-bar
  > div.mobile-prototype-shell__ios-tools
```

## Sample layout (captured from devtools)

| Property | Value   |
|----------|---------|
| Position | `top=781px, left=0px` |
| Size     | `width=415px, height=68px` |

Exact pixel values depend on viewport and shell chrome; treat as indicative.

## Notes

- The tools row (`mobile-prototype-shell__ios-tools`) sits inside `mobile-prototype-shell__ios-bar`, which is positioned at the bottom of the device frame in the iOS prototype variant.
- Use this file when re-implementing spacing, z-index, or sticky UI that must clear this chrome.
