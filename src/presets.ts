export type Preset = "thumbnail" | "avatar" | "raw";

export const presets = {
  thumbnail: {
    quality: 40,
    format: "webp",
    fit: "scale-down",
    width: 400,
  },

  avatar: {
    quality: 80,
    format: "webp",
    fit: "scale-down",
    width: 256,
    height: 256,
  },

  // png has the best compression of CF Images' supported formats, while still
  // allowing us to keep it cached.
  raw: {
    format: "png",
  },
} as const satisfies Record<Preset, RequestInitCfPropertiesImage>;
