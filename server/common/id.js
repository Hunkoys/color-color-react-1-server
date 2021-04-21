module.exports.create = (length) => {
  const id = Math.random().toString().substr(2, length);
  return Number(id);
};
