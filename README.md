# cdnat

Serverless ATProto blob CDN powered by Cloudflare Workers, Images, and KV.

## Presets

Three presets exist;

- `thumbnail`: 40% quality, WebP, 400px wide
- `avatar`: 80% quality, WebP, 256px wide, 256px tall
- `raw`: no transformation, format changed to `png`

## Accessing

To get a transformed image, you can use the following URL protocol:

```http
GET cdnat.hayden.moe/:preset/:did/:cid
```

For example:

**`thumbnail`:**
![A visually-busy image of some wood chippings](https://cdnat.hayden.moe/thumbnail/did:plc:puvaym5ytsvejx3rwjrnxhvb/bafkreia75iidojw43ntqmspwjjfmum5evnk4lckncsqeoy5llcwllwg3su)

**`avatar`:**
![A visually-busy image of some wood chippings](https://cdnat.hayden.moe/avatar/did:plc:puvaym5ytsvejx3rwjrnxhvb/bafkreia75iidojw43ntqmspwjjfmum5evnk4lckncsqeoy5llcwllwg3su)

**`raw`:**
![A visually-busy image of some wood chippings](https://cdnat.hayden.moe/raw/did:plc:puvaym5ytsvejx3rwjrnxhvb/bafkreia75iidojw43ntqmspwjjfmum5evnk4lckncsqeoy5llcwllwg3su)
