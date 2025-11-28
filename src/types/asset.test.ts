import { describe, it, expect } from 'vitest';
import { SECTORS, ASSET_GROUPS, CONSERVATION_STATES } from './asset';

describe('Asset Type Constants', () => {
  describe('SECTORS', () => {
    it('should contain expected sectors', () => {
      expect(SECTORS).toContain('Gerência');
      expect(SECTORS).toContain('Recepção');
      expect(SECTORS).toContain('Manutenção');
      expect(SECTORS).toContain('Cozinha');
    });

    it('should have correct length', () => {
      expect(SECTORS.length).toBeGreaterThan(10);
    });
  });

  describe('ASSET_GROUPS', () => {
    it('should contain expected groups', () => {
      expect(ASSET_GROUPS).toContain('Móveis');
      expect(ASSET_GROUPS).toContain('Eletrodomésticos');
      expect(ASSET_GROUPS).toContain('Eletrônicos');
      expect(ASSET_GROUPS).toContain('TI');
    });

    it('should have 8 groups', () => {
      expect(ASSET_GROUPS.length).toBe(8);
    });
  });

  describe('CONSERVATION_STATES', () => {
    it('should have all conservation states', () => {
      expect(CONSERVATION_STATES).toEqual(['Novo', 'Bom', 'Regular', 'Ruim']);
    });

    it('should be in order from best to worst', () => {
      expect(CONSERVATION_STATES[0]).toBe('Novo');
      expect(CONSERVATION_STATES[3]).toBe('Ruim');
    });
  });
});
