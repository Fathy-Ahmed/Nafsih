const palette = {
  cream: "#F7F5F0",
  creamSoft: "#EFEAD9",
  ink: "#2A2A28",
  inkSoft: "#5A554C",
  muted: "#6B6356",
  border: "#E5DFCE",
  white: "#FFFFFF",

  sage: "#2B4C3F",
  sageDeep: "#1F3830",
  sageGlow: "#3A6453",

  sand: "#BFA588",
  sandLight: "#E8D9BF",
  sandPale: "#F2EEDF",

  blush: "#8E6855",
  blushSoft: "#B98C73",

  danger: "#B23A48",
};

const colors = {
  light: {
    text: palette.ink,
    tint: palette.sage,

    background: palette.cream,
    foreground: palette.ink,

    card: palette.white,
    cardForeground: palette.ink,

    primary: palette.sage,
    primaryForeground: palette.cream,

    secondary: palette.sand,
    secondaryForeground: palette.sage,

    muted: palette.creamSoft,
    mutedForeground: palette.muted,

    accent: palette.blush,
    accentForeground: palette.white,

    destructive: palette.danger,
    destructiveForeground: palette.white,

    border: palette.border,
    input: palette.border,

    sageDeep: palette.sageDeep,
    sageGlow: palette.sageGlow,
    sandLight: palette.sandLight,
    sandPale: palette.sandPale,
    blushSoft: palette.blushSoft,
    inkSoft: palette.inkSoft,
  },
  radius: 20,
};

export default colors;
