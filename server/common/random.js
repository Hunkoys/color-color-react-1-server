module.exports.random = (n, offset = 0) => {
  return Math.floor(Math.random() * n) + offset;
};
