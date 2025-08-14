// Express middleware to validate req[source] with a Zod-like schema.
// Usage: app.post('/route', validate(schema), handler)
//        app.get('/route', validate(querySchema, 'query'), handler)
export const validate = (schema, source = "body") => {
  if (!schema || typeof schema.safeParse !== "function") {
    throw new Error(
      "validate(schema): schema must be a Zod schema with safeParse()"
    );
  }

  const allowed = new Set(["body", "query", "params"]);
  if (!allowed.has(source)) {
    throw new Error(
      `validate: unsupported source '${source}'. Use 'body' | 'query' | 'params'.`
    );
  }

  return (req, res, next) => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (!result.success) {
      const flat = result.error.flatten();
      return res.status(400).json({
        message: "Validation failed",
        errors: flat,
      });
    }

    // Replace with parsed/validated data (coercions applied).
    req[source] = result.data;
    next();
  };
};
