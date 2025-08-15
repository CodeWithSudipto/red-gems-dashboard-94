import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { regionalRepository, territoryRepository, areaRepository } from '@/data';
import { Regional, Territory, Area } from '@/types/entities';
import { initializeBangladeshData } from '@/data/mock/bangladeshData';

interface CascadingLocationSelectProps {
  onLocationSelect: (location: { regionalId?: string; territoryId?: string; areaId?: string }) => void;
  initialValues?: { regionalId?: string; territoryId?: string; areaId?: string };
  disabled?: boolean;
}

export function CascadingLocationSelect({ onLocationSelect, initialValues, disabled }: CascadingLocationSelectProps) {
  const [regionals, setRegionals] = useState<Regional[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedRegional, setSelectedRegional] = useState(initialValues?.regionalId || '');
  const [selectedTerritory, setSelectedTerritory] = useState(initialValues?.territoryId || '');
  const [selectedArea, setSelectedArea] = useState(initialValues?.areaId || '');

  useEffect(() => {
    initializeBangladeshData();
    loadRegionals();
  }, []);

  useEffect(() => {
    if (selectedRegional) {
      loadTerritories(selectedRegional);
    } else {
      setTerritories([]);
      setAreas([]);
      setSelectedTerritory('');
      setSelectedArea('');
    }
  }, [selectedRegional]);

  useEffect(() => {
    if (selectedTerritory) {
      loadAreas(selectedTerritory);
    } else {
      setAreas([]);
      setSelectedArea('');
    }
  }, [selectedTerritory]);

  useEffect(() => {
    onLocationSelect({
      regionalId: selectedRegional || undefined,
      territoryId: selectedTerritory || undefined,
      areaId: selectedArea || undefined,
    });
  }, [selectedRegional, selectedTerritory, selectedArea, onLocationSelect]);

  const loadRegionals = async () => {
    try {
      const result = await regionalRepository.list({ limit: 1000 });
      setRegionals(result.data);
    } catch (error) {
      console.error('Failed to load regionals:', error);
    }
  };

  const loadTerritories = async (regionalId: string) => {
    try {
      const result = await territoryRepository.list({ 
        limit: 1000,
        filters: { regionalId }
      });
      setTerritories(result.data);
    } catch (error) {
      console.error('Failed to load territories:', error);
    }
  };

  const loadAreas = async (territoryId: string) => {
    try {
      const result = await areaRepository.list({ 
        limit: 1000,
        filters: { territoryId }
      });
      setAreas(result.data);
    } catch (error) {
      console.error('Failed to load areas:', error);
    }
  };

  const handleRegionalChange = (value: string) => {
    setSelectedRegional(value);
    setSelectedTerritory('');
    setSelectedArea('');
  };

  const handleTerritoryChange = (value: string) => {
    setSelectedTerritory(value);
    setSelectedArea('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label htmlFor="regional">Regional</Label>
        <Select 
          value={selectedRegional} 
          onValueChange={handleRegionalChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select regional" />
          </SelectTrigger>
          <SelectContent>
            {regionals.map((regional) => (
              <SelectItem key={regional.id} value={regional.id}>
                {regional.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="territory">Territory</Label>
        <Select 
          value={selectedTerritory} 
          onValueChange={handleTerritoryChange}
          disabled={disabled || !selectedRegional}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select territory" />
          </SelectTrigger>
          <SelectContent>
            {territories.map((territory) => (
              <SelectItem key={territory.id} value={territory.id}>
                {territory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="area">Area</Label>
        <Select 
          value={selectedArea} 
          onValueChange={setSelectedArea}
          disabled={disabled || !selectedTerritory}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select area" />
          </SelectTrigger>
          <SelectContent>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}