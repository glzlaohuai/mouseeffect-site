# MouseEffect website

## Register

brand

## Users

Mac users who want a little personality on the desktop without a complex setup or interruptions to normal pointer input. Visitors need to understand the real app, compatibility, free features, optional purchase, and data handling before release. These needs are grounded in the native application's PRODUCT.md and inspected implementation.

## Product Purpose

Present MouseEffect, a native macOS 27.0+ mouse particle utility from Hiimob Apps. Explain motion, single click, double click, right click and drag effects, built-in presets, and customizable content. Offer accurate multilingual privacy and support information. App Store ID: 6828321000. The app is not yet available; downloads must say coming soon. The native interface is currently Chinese, even though this website has fourteen languages.

## Brand Personality

Native, restrained, playful. The native project references macOS settings and Raycast: clear controls, quiet surfaces, personality carried by the pointer effects. The approved website brief calls for a bright macOS utility feeling, system fonts and orange accents.

## Anti-references

Avoid game control panels, decorative card grids, heavy motion, invented application screens, stock imagery that misrepresents the product, subscription implications, premature App Store download claims, and claims of translated native interfaces.

## Design Principles

- Show the actual product with current screenshots and a clearly labeled browser particle demo.
- Preserve the ordinary pointer: effects observe mouse events locally without replacing, intercepting or recording the pointer.
- Be precise about the purchase: built-in effects and temporary custom editing/preview are free; a one-time purchase unlocks saving and activating custom effects. US$4.99 is the base price; the App Store determines local pricing. Restoring purchases is supported.
- Keep help close: all fourteen locales have complete home, privacy and support content, with page-preserving language navigation.
- Respect attention and privacy: no accounts, analytics SDKs, advertising, web forms or external font requests. Support uses email.

## Accessibility & Inclusion

Semantic pages, keyboard navigation, visible focus, responsive layout, readable contrast and non-color status labels. Arabic uses RTL. Respect prefers-reduced-motion, provide a persistent pause button for the canvas, and support a keyboard-triggered particle preview. The approved brief explicitly dispenses with AI-generated imagery; use the original icon, current screenshots and the browser demo.

## Source of truth

Read-only inspection: native PRODUCT.md, PointerEventMonitor.swift, SettingsStore.swift, PresetStore.swift, EffectAssetStore.swift, CustomEffectsPurchaseService.swift and overlay implementation. Settings use UserDefaults. Presets and imported assets live in local sandbox application support. Apple/StoreKit handles purchases, with no developer payment server. Mouse monitoring does not include global keyboard events. Local editor keyboard handling is normal focused control input.
