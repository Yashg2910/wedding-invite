// Everything you are likely to edit lives here.
window.INVITE_CONFIG = {
  // Countdown target (ISO date with the IST offset). This is a SAMPLE date: replace it.
  weddingDate: '2026-11-28T19:00:00+05:30',

  // Your family surname. '' shows "Our families welcome you to the wedding of".
  // 'Sharma' shows "The Sharma family welcomes you to the wedding of".
  hostFamily: '',

  // Image layers. *_size is [width, height] in pixels and must match the files
  // (tools/prep_assets.py prints these when it regenerates the art).
  assets: {
      "gate": "assets/gate.webp",
      "haldi_bg": "assets/haldi_bg.webp",
      "haldi_fg": "assets/haldi_fg.webp",
      "sangeet_bg": "assets/sangeet_bg.webp",
      "sangeet_fg": "assets/sangeet_fg.webp",
      "phere_bg": "assets/phere_bg.webp",
      "phere_fg": "assets/phere_fg.webp",
      "reception_bg": "assets/reception_bg.webp",
      "reception_fg": "assets/reception_fg.webp",
      "haldi_size": [
          900,
          1200
      ],
      "sangeet_size": [
          900,
          939
      ],
      "phere_size": [
          900,
          1200
      ],
      "reception_size": [
          900,
          1601
      ]
  }
};
