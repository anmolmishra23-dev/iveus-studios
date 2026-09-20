# Validation

- Production Tailwind CSS generated successfully with the pinned toolchain.
- Three.js distribution bundled locally with license; JavaScript syntax checks passed.
- Revised commercial homepage rendered and visually reviewed in the preview browser.
- Narrow layout rendered in a 390px-wide preview frame (375px content width after scrollbar): no horizontal overflow.
- Mobile menu opened and navigated correctly in the initial interaction check.
- Revised Products filter returned two photographs; product lightbox opened with correct title and attribution.
- Enquiry preparation generated correct email and WhatsApp destinations for iveusstudios@gmail.com and +91 95594 81865. No messages were sent.
- 28 local HTML/CSS/JS image, font and module references checked for existence, along with all anchor targets.
- Gallery configuration verified: 8 photographs, with models, brands and products leading and 1 secondary wedding item.
- Sample photo assets and attribution verified before integration; source photo manifest included.

## Limits

The earlier preview browser disabled WebGL contexts, and the static-photo fallback worked. The Three.js animation has not been fully visually verified on a GPU-enabled device; test it in a WebGL2-enabled browser on your own device. The site does not require WebGL for navigation, photographs or enquiries.

The responsive check used a narrow browser frame, not a physical phone. Native email and WhatsApp sending were not exercised; only their generated URLs were verified. No hosting deployment was performed.
