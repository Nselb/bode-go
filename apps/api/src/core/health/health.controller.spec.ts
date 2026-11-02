import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { MockFactory, Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let healthController: HealthController;
  let check: MockFactory;
  const result: HealthCheckResult = { status: 'ok', details: {} };

  beforeEach(async () => {
    check = vi.fn<() => HealthCheckResult>().mockResolvedValue(result);
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check },
        },
      ],
    }).compile();
    healthController = moduleRef.get(HealthController);
  });

  describe('live', () => {
    it('should return the terminus check result', async () => {
      expect(await healthController.live()).toEqual(result);
      expect(check).toHaveBeenCalledWith([]);
    });
  });
});
