module.exports.pack = (contents) => {
  const packet = { contents };
  return JSON.stringify(packet);
};

module.exports.unpack = (packet) => {
  const contents =
    packet instanceof String || typeof packet === 'string' ? JSON.parse(packet).contents : packet.contents;
  return contents;
};
