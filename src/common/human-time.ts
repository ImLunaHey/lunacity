import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en-AU';
import ru from 'javascript-time-ago/locale/ru';

TimeAgo.addLocale(en);
TimeAgo.addLocale(ru);
TimeAgo.addDefaultLocale(en);

export const humanTime = (timestamp: Date, locale = 'en-AU') => {
  const timeAgo = new TimeAgo(locale);
  return timeAgo.format(timestamp);
};
