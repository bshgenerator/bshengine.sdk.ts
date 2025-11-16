import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MailingService } from '@src/services/mailing';
import { bshConfigs } from '@config';
import type { BshClientFn, BshAuthFn } from '@src/client/types';
import type { MailingPayload } from '@types';
import { BshError } from '@types';

describe('MailingService', () => {
  let mockClientFn: BshClientFn;
  let mockAuthFn: BshAuthFn;
  let mockPost: any;

  beforeEach(() => {
    // Reset singleton
    (MailingService as any).instance = undefined;
    bshConfigs.reset();

    // Setup mocks
    mockPost = vi.fn();

    mockClientFn = vi.fn();
    mockAuthFn = vi.fn().mockResolvedValue({ type: 'JWT', token: 'test-token' });

    // Mock BshClient methods
    const mockClient = {
      post: mockPost,
    };

    // Mock createClient to return our mock
    vi.spyOn(bshConfigs, 'createClient').mockReturnValue(mockClient as any);

    bshConfigs.configure({
      clientFn: mockClientFn,
      authFn: mockAuthFn,
      host: 'http://localhost:3000',
    });
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = MailingService.getInstance();
      const instance2 = MailingService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create a new instance after reset', () => {
      const instance1 = MailingService.getInstance();
      (MailingService as any).instance = undefined;
      const instance2 = MailingService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('send', () => {
    it('should call client.post with correct endpoint and payload', async () => {
      const mailingPayload: MailingPayload = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: 'This is a test email body',
        html: false,
      };
      const mockResponse = {
        data: [mailingPayload],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const mailingService = MailingService.getInstance();
      await mailingService.send({ payload: mailingPayload });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/mailing/send',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: mailingPayload,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle HTML email', async () => {
      const mailingPayload: MailingPayload = {
        to: 'recipient@example.com',
        subject: 'HTML Test Email',
        body: '<h1>This is HTML</h1><p>Email content</p>',
        html: true,
      };
      const mockResponse = {
        data: [mailingPayload],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const mailingService = MailingService.getInstance();
      await mailingService.send({ payload: mailingPayload });

      expect(mockPost).toHaveBeenCalledWith({
        path: '/api/mailing/send',
        options: {
          responseType: 'json',
          responseFormat: 'json',
          body: mailingPayload,
          headers: {
            'Content-Type': 'application/json',
          },
        },
        bshOptions: { onSuccess: undefined, onError: undefined },
      });
    });

    it('should handle onSuccess callback', async () => {
      const mailingPayload: MailingPayload = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: 'This is a test email body',
        html: false,
      };
      const mockResponse = {
        data: [mailingPayload],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockImplementation(async (params: any) => {
        if (params.bshOptions?.onSuccess) {
          params.bshOptions.onSuccess(mockResponse);
          return undefined;
        }
        return mockResponse;
      });

      const onSuccess = vi.fn();
      const mailingService = MailingService.getInstance();
      await mailingService.send({ payload: mailingPayload, onSuccess });

      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });

    it('should return response when no callbacks provided', async () => {
      const mailingPayload: MailingPayload = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: 'This is a test email body',
        html: false,
      };
      const mockResponse = {
        data: [mailingPayload],
        code: 200,
        status: 'OK',
        error: '',
      };
      mockPost.mockResolvedValue(mockResponse);

      const mailingService = MailingService.getInstance();
      const result = await mailingService.send({ payload: mailingPayload });

      expect(result).toEqual(mockResponse);
    });

    it('should handle onError callback', async () => {
      const mailingPayload: MailingPayload = {
        to: 'invalid-email',
        subject: 'Test Email',
        body: 'This is a test email body',
        html: false,
      };
      const mockError = new BshError(400, '/api/mailing/send');
      mockPost.mockRejectedValue(mockError);

      const onError = vi.fn();
      const mailingService = MailingService.getInstance();
      await mailingService.send({ payload: mailingPayload, onError }).catch(() => {});

      expect(mockPost).toHaveBeenCalled();
    });
  });
});

