"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
describe('SnippetVault API (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('App Root', () => {
        it('should return 404 on GET /api (no root handler)', () => {
            return (0, supertest_1.default)(app.getHttpServer())
                .get('/api')
                .expect(404);
        });
    });
    describe('Auth', () => {
        const testUser = {
            username: `e2euser_${Date.now()}`,
            email: `e2e_${Date.now()}@test.com`,
            password: 'testpass123',
        };
        let authToken;
        it('POST /api/auth/register - should register a new user', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);
            expect(res.body).toHaveProperty('token');
            authToken = res.body.token;
        });
        it('POST /api/auth/register - should reject duplicate registration', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/register')
                .send(testUser)
                .expect(409);
        });
        it('POST /api/auth/login - should login with valid credentials', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/login')
                .send({ username: testUser.username, password: testUser.password })
                .expect(200);
            expect(res.body).toHaveProperty('token');
            authToken = res.body.token;
        });
        it('POST /api/auth/login - should reject invalid credentials', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/login')
                .send({ username: testUser.username, password: 'wrongpassword' })
                .expect(401);
        });
    });
    describe('Snippets', () => {
        let snippetId;
        let authToken;
        beforeAll(async () => {
            const registerRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                username: `snippets_user_${Date.now()}`,
                email: `snippets_${Date.now()}@test.com`,
                password: 'testpass123',
            });
            authToken = registerRes.body.token;
        });
        it('GET /api/snippets - should return empty list initially', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/snippets')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('POST /api/snippets - should create a snippet (auth required)', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/snippets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                title: 'E2E Test Snippet',
                code: 'console.log("e2e test")',
                language: 'typescript',
            })
                .expect(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('E2E Test Snippet');
            snippetId = res.body.id;
        });
        it('POST /api/snippets - should reject without auth', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/snippets')
                .send({
                title: 'Unauthorized',
                code: 'test',
            })
                .expect(401);
        });
        it('GET /api/snippets/:id - should return a snippet by id', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/api/snippets/${snippetId}`)
                .expect(200);
            expect(res.body.id).toBe(snippetId);
        });
        it('GET /api/snippets/:id - should return 404 for non-existent', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/snippets/99999')
                .expect(404);
        });
        it('PUT /api/snippets/:id - should update a snippet', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .put(`/api/snippets/${snippetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Updated E2E Snippet' })
                .expect(200);
            expect(res.body.title).toBe('Updated E2E Snippet');
        });
        it('GET /api/snippets?language=typescript - should filter by language', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/snippets?language=typescript')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('GET /api/snippets?search=console - should search snippets', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/snippets?search=console')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('DELETE /api/snippets/:id - should delete a snippet', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/api/snippets/${snippetId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
        });
    });
    describe('Tags', () => {
        let tagId;
        let authToken;
        beforeAll(async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                username: `tags_user_${Date.now()}`,
                email: `tags_${Date.now()}@test.com`,
                password: 'testpass123',
            });
            authToken = res.body.token;
        });
        it('GET /api/tags - should return empty list initially', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/tags')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('POST /api/tags - should create a tag', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/tags')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: `e2e-tag-${Date.now()}`, color: '#FF5733' })
                .expect(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('name');
            tagId = res.body.id;
        });
        it('POST /api/tags - should reject duplicate tag', async () => {
        });
        it('GET /api/tags/:id - should return a tag', async () => {
            if (tagId) {
                const res = await (0, supertest_1.default)(app.getHttpServer())
                    .get(`/api/tags/${tagId}`)
                    .expect(200);
                expect(res.body.id).toBe(tagId);
            }
        });
        it('DELETE /api/tags/:id - should delete a tag', async () => {
            if (tagId) {
                await (0, supertest_1.default)(app.getHttpServer())
                    .delete(`/api/tags/${tagId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);
            }
        });
    });
    describe('Collections', () => {
        let collectionId;
        let authToken;
        beforeAll(async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                username: `collections_user_${Date.now()}`,
                email: `collections_${Date.now()}@test.com`,
                password: 'testpass123',
            });
            authToken = res.body.token;
        });
        it('GET /api/collections - should return empty list initially', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/collections')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('POST /api/collections - should create a collection', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/collections')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: `E2E Collection ${Date.now()}`, description: 'Test' })
                .expect(201);
            expect(res.body).toHaveProperty('id');
            collectionId = res.body.id;
        });
        it('GET /api/collections/:id - should return a collection', async () => {
            if (collectionId) {
                const res = await (0, supertest_1.default)(app.getHttpServer())
                    .get(`/api/collections/${collectionId}`)
                    .expect(200);
                expect(res.body.id).toBe(collectionId);
            }
        });
        it('PUT /api/collections/:id - should update a collection', async () => {
            if (collectionId) {
                const res = await (0, supertest_1.default)(app.getHttpServer())
                    .put(`/api/collections/${collectionId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({ name: 'Updated Collection' })
                    .expect(200);
                expect(res.body.name).toBe('Updated Collection');
            }
        });
        it('DELETE /api/collections/:id - should delete a collection', async () => {
            if (collectionId) {
                await (0, supertest_1.default)(app.getHttpServer())
                    .delete(`/api/collections/${collectionId}`)
                    .set('Authorization', `Bearer ${authToken}`)
                    .expect(200);
            }
        });
    });
    describe('Search', () => {
        it('GET /api/search?q=test - should return search results', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/search?q=test')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
        it('GET /api/search?q= - should return empty for empty query', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/search?q=')
                .expect(200);
            expect(res.body).toEqual([]);
        });
        it('GET /api/search?q=test&language=typescript - should filter by language', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/api/search?q=test&language=typescript')
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
    describe('AI Analysis', () => {
        let snippetId;
        let authToken;
        beforeAll(async () => {
            const registerRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/auth/register')
                .send({
                username: `ai_user_${Date.now()}`,
                email: `ai_${Date.now()}@test.com`,
                password: 'testpass123',
            });
            authToken = registerRes.body.token;
            const snippetRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/api/snippets')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                title: 'AI Test Snippet',
                code: 'function add(a: number, b: number) { return a + b; }',
                language: 'typescript',
            });
            snippetId = snippetRes.body.id;
        });
        it('POST /api/ai/analyze/:snippetId - should analyze a snippet', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post(`/api/ai/analyze/${snippetId}`)
                .expect(201);
            expect(res.body).toHaveProperty('complexity');
            expect(res.body).toHaveProperty('lines');
            expect(res.body).toHaveProperty('score');
            expect(res.body).toHaveProperty('suggestions');
            expect(res.body).toHaveProperty('language');
        });
        it('GET /api/ai/analyses/:snippetId - should get analyses', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/api/ai/analyses/${snippetId}`)
                .expect(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });
});
//# sourceMappingURL=app.e2e-spec.js.map