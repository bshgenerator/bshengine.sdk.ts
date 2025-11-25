import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MailingService } from '../../../src/services/mailing';
import { BshClient } from '../../../src/client/bsh-client';
import { MailingPayload } from '../../../src/types';

describe('MailingService', () => {
    let mailingService: MailingService;
    let mockClient: BshClient;
    let mockPost: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockPost = vi.fn();
        mockClient = {
            get: vi.fn(),
            post: mockPost,
            put: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
            download: vi.fn(),
        } as unknown as BshClient;
        mailingService = new MailingService(mockClient);
    });

    describe('send', () => {
        it('should call client.post with correct parameters', async () => {
            const mockPayload: MailingPayload = {
                to: 'test@example.com',
                subject: 'Test Email',
                body: 'Test body'
            } as MailingPayload;
            const mockResponse = {
                data: [mockPayload],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const params = {
                payload: mockPayload,
                onSuccess: vi.fn(),
                onError: vi.fn()
            };

            const result = await mailingService.send(params);

            expect(mockPost).toHaveBeenCalledWith({
                path: '/api/mailing/send',
                options: {
                    responseType: 'json',
                    requestFormat: 'json',
                    body: mockPayload,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                bshOptions: { onSuccess: params.onSuccess, onError: params.onError },
            });
            expect(result).toEqual(mockResponse);
        });

        it('should handle callbacks correctly', async () => {
            const mockPayload: MailingPayload = {
                to: 'test@example.com',
                subject: 'Test',
                body: 'Body'
            } as MailingPayload;
            const mockResponse = {
                data: [mockPayload],
                code: 200,
                status: 'OK',
                error: '',
                timestamp: Date.now()
            };
            mockPost.mockResolvedValue(mockResponse);

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await mailingService.send({
                payload: mockPayload,
                onSuccess,
                onError
            });

            expect(mockPost).toHaveBeenCalled();
        });
    });
});

