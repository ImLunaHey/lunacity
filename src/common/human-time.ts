import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en-AU';

TimeAgo.addLocale(en);

export const humanTime = (timestamp: Date, locale = 'en-AU') => {
  const timeAgo = new TimeAgo(locale);
  return timeAgo.format(timestamp);
};