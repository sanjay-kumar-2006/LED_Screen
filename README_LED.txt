REIN — COLLEGE LED DISPLAY
==========================

Target content resolution
-------------------------
1152 × 2048 px (PORTRAIT)

Physical LED wall information supplied
---------------------------------------
Width  : 6144 mm
Height : 3456 mm
Area   : 230.3 sq ft
Model  : P4 Outdoor LED Video Wall, rear maintenance

Controller / processor information supplied
--------------------------------------------
- NovaStar Offline Controller with built-in 32 GB memory
- Upload / playback via HDMI, Ethernet (LAN), USB pen drive, Wi-Fi / mobile app
- Online synchronous LED video processor
- Inputs include CVBS, VGA, DVI in + loop, HDMI 1.3, DisplayPort, 3G-SDI in + loop
- 4 × Gigabit Ethernet outputs

Display flow
------------
Weather -> Air Quality -> Noise -> repeat continuously

Default slide duration
----------------------
12 seconds per page.
Change js/config.js -> slideMs to adjust it.
Example: 8000 = 8 seconds, 15000 = 15 seconds.

Run
---
Open index.html in a modern Chromium-based browser.
For live data polling from data.json, using a small local web server is recommended.

Keyboard controls
-----------------
Right / PageDown : next page
Left / PageUp    : previous page
1 / 2 / 3        : Weather / Air Quality / Noise
Space or P       : pause/resume slideshow
F                : fullscreen

Important
---------
The webpage is intentionally fixed at 1152 × 2048 and contains no scrolling.
Do not change the webpage to match the LED wall's millimetre dimensions.
NovaStar screen mapping/output configuration should handle the physical LED layout.
