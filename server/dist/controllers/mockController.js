import { prisma } from '../services/prisma.js';
export async function listMocks(req, res) {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    const mocks = await prisma.mockApi.findMany({
        where: { userId: req.user.sub },
        orderBy: { createdAt: 'desc' },
    });
    res.json(mocks);
}
export async function createMock(req, res) {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    const incoming = req.body;
    if (!incoming.route || !incoming.method || !incoming.response) {
        res.status(400).json({ message: 'route, method, and response are required' });
        return;
    }
    const mock = await prisma.mockApi.create({
        data: {
            route: incoming.route,
            method: incoming.method.toUpperCase(),
            statusCode: incoming.statusCode ?? 200,
            delayMs: incoming.delayMs ?? 0,
            response: incoming.response,
            userId: req.user.sub,
        },
    });
    res.status(201).json(mock);
}
export async function deleteMock(req, res) {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    const rawMockId = req.params.id;
    const mockId = Array.isArray(rawMockId) ? rawMockId[0] : rawMockId;
    if (!mockId) {
        res.status(400).json({ message: 'Mock id is required' });
        return;
    }
    const existing = await prisma.mockApi.findFirst({
        where: { id: mockId, userId: req.user.sub },
    });
    if (!existing) {
        res.status(404).json({ message: 'Mock endpoint not found' });
        return;
    }
    await prisma.mockApi.delete({ where: { id: mockId } });
    res.status(204).send();
}
export async function exportMocksOpenApi(req, res) {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    const mocks = await prisma.mockApi.findMany({
        where: { userId: req.user.sub },
        orderBy: { createdAt: 'desc' },
    });
    const paths = mocks.reduce((acc, mock) => {
        const method = mock.method.toLowerCase();
        if (!acc[mock.route]) {
            acc[mock.route] = {};
        }
        acc[mock.route][method] = {
            summary: `Mocked ${mock.method} ${mock.route}`,
            responses: {
                [mock.statusCode]: {
                    description: 'Mock response',
                    content: {
                        'application/json': {
                            example: mock.response,
                        },
                    },
                },
            },
        };
        return acc;
    }, {});
    const host = req.get('host');
    const protocol = req.protocol;
    const doc = {
        openapi: '3.1.0',
        info: {
            title: 'DevDash Mock API',
            version: '1.0.0',
        },
        servers: [{ url: `${protocol}://${host}` }],
        paths,
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="devdash-openapi.json"');
    res.status(200).json(doc);
}
export async function exportMocksPostman(req, res) {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    const mocks = await prisma.mockApi.findMany({
        where: { userId: req.user.sub },
        orderBy: { createdAt: 'desc' },
    });
    const host = req.get('host');
    const protocol = req.protocol;
    const collection = {
        info: {
            name: 'DevDash Mock API Collection',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        item: mocks.map((mock) => ({
            name: `${mock.method} ${mock.route}`,
            request: {
                method: mock.method,
                header: [{ key: 'Content-Type', value: 'application/json' }],
                url: {
                    raw: `${protocol}://${host}${mock.route}`,
                    host: [host ?? 'localhost:4000'],
                    path: mock.route.split('/').filter(Boolean),
                },
            },
            response: [
                {
                    name: `${mock.statusCode} Response`,
                    code: mock.statusCode,
                    body: JSON.stringify(mock.response, null, 2),
                    _postman_previewlanguage: 'json',
                },
            ],
        })),
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="devdash-postman.json"');
    res.status(200).json(collection);
}
