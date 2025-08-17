export function serializeBigInt(req, res, next) {
  const oldJson = res.json;
  res.json = function (data) {
    const serialized = JSON.parse(
      JSON.stringify(data, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );
    oldJson.call(this, serialized);
  };
  next();
}
