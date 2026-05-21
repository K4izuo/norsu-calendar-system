type RouteParamValue = string | string[] | undefined;

export function getRouteParam(
  params: Record<string, RouteParamValue> | null | undefined,
  key: string,
  fallback: string = "",
): string {
  if (!params) return fallback;
  const value = params[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return fallback;
}
