/* REIN LED display operator settings.
   REQUIRED CONTENT CANVAS: 1152 × 2048 pixels (portrait).
   Physical LED wall: 6144 mm wide × 3456 mm high.
   Playback/processing: NovaStar offline controller / online sync video processor.
   The NovaStar processor/controller is responsible for mapping this content canvas
   to the configured LED cabinet / receiving-card layout. */
window.LED_CONFIG = {
  width: 1152,
  height: 2048,
  slideMs: 7000,
  transitionMs: 650,
  dataPollMs: 30000,
  dataUrl: 'data.json',
  hideCursorMs: 4000
};
