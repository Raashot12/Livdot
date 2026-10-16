export const shouldUseMockEventApi =
  process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_ENABLE_MOCKS !== "false");
