import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export const generateUsername = () => uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    seed: new Date().toISOString(),
});
