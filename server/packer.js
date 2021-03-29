module.exports.pack = (contents) => {
  const packet = { contents };
  return JSON.stringify(packet);
};

module.exports.unpack = (packet) => {
  return packet.contents;
};
