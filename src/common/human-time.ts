import prettyMilliseconds from "pretty-ms";

export const humanTime = (date: Date) => {
  const diff = new Date().getTime() - date.getTime();
  const suffix = diff < 0 ? "from now" : "ago";

  return `${prettyMilliseconds(diff, { compact: true })} ${suffix}`;
};
