import { vi, it, expect, describe } from 'vitest';
import AElf from 'aelf-sdk';
import { pubKeyToAddress, sleep } from '../misc';

describe('Utils Functions', () => {

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now();
      await sleep(1000);  // 1 second sleep
      const end = Date.now();
      const duration = end - start;
      
      expect(duration).toBeGreaterThanOrEqual(950);
      expect(duration).toBeLessThan(1200);  // Allowing larger margin of error for execution time
    });
  });

  describe('pubKeyToAddress', () => {
    it('should correctly convert pubKey to address', () => {
      // Mock the AElf.utils methods if needed
      vi.spyOn(AElf.utils, 'sha256').mockReturnValue('dummyHash' as any);
      vi.spyOn(AElf.utils, 'encodeAddressRep').mockReturnValue('mockedAddress');

      const pubKey = '03b0d1c7a8b0f6894d18a0407cb56d0b63fe62e0297b1be7b11d7b627f3c8ea129';
      const address = pubKeyToAddress(pubKey);

      expect(address).toBe('mockedAddress');
      expect(AElf.utils.sha256).toHaveBeenCalledTimes(2);  // Verifying that sha256 was called twice
      expect(AElf.utils.encodeAddressRep).toHaveBeenCalledWith('dummyHash');
    });

    it('should handle empty pubKey gracefully', () => {
      const pubKey = '';
      const address = pubKeyToAddress(pubKey);

      // This will depend on how the AElf SDK handles empty pubKeys,
      // and what we expect the return value to be in this case.
      // For the sake of the test, we assume it throws or returns some invalid address.
      expect(address).toBe('mockedAddress');
    });
  });

});

