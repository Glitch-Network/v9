
  
self.__uv$config = {
    prefix: "/assets-images/backgrounds/",
    encodeUrl: function (url) { return Ultraviolet.codec.base64.encode(Ultraviolet.codec.xor.encode(url)); },
    decodeUrl: function (url) { return Ultraviolet.codec.xor.decode(Ultraviolet.codec.base64.decode(url)); },
    handler: "/uv/uv.handler.js",
    client: "/uv/uv.client.js",
    bare: "/bare/",
    bundle: "/uv/uv.bundle.js",
    config: "/uv/uv.config.js",
    sw: "/uv/uv.sw.js",
  };