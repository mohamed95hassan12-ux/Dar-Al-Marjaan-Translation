DAR AL MARJAAN — Client Intake Prototype (Static)
===================================================

WHAT THIS IS
------------
A static, single-page prototype for collecting translation requests, styled with
Dar Al Marjaan colors (gold/grey), including:
- Hero section with 3 actions (Fill Form, Call, WhatsApp)
- Full intake form (file upload) with client consent
- Fixed bottom contact bar (Call + WhatsApp)
- LocalStorage save + success message + optional WhatsApp compose

FILES
-----
index.html
styles.css
app.js
assets/logo.svg

WHERE TO CHANGE CONTACT INFO
----------------------------
Edit the following values in index.html near the top:
- tel:+971561234567
- WhatsApp link: https://wa.me/971561234567?text=Hello%20Dar%20Al%20Marjaan%2C%20I%27d%20like%20to%20ask%20about%20a%20translation.

Or adjust the global BRAND object at the bottom of index.html.

BRANDING
--------
Primary gold: #C9A76A
Grey: #5A5A5A
You can tweak them in styles.css :root variables.

NOTES
-----
- This is a static prototype (no backend). Files are not uploaded anywhere.
- To go live, connect back-end endpoints:
  POST /api/tickets
  POST /api/uploads (signed URLs)
  POST /api/messages/whatsapp
- Consider WhatsApp Cloud API for messaging after 24h window (templates).
