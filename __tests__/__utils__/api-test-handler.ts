import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { RequestOptions } from 'node-mocks-http';
import { createRequest, createResponse } from 'node-mocks-http';

export const apiTestHandler = async (
    handler: NextApiHandler,
    options: RequestOptions
) => {
    const req = createRequest<NextApiRequest>(options);
    const res = createResponse<NextApiResponse>();

    await handler(req, res);
    return res;
};
