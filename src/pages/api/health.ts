import type { NextApiRequest, NextApiResponse } from 'next';

const Health = (_request: NextApiRequest, response: NextApiResponse) => {
    response.status(200).end();
};

export default Health;
