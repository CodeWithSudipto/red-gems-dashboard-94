import { Regional, Territory, Area } from '@/types/entities';
import { uid, now } from '@/utils';

// Bangladesh regional data
export const bangladeshRegionals: Omit<Regional, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Dhaka' },
  { name: 'Chattogram' },
  { name: 'Rajshahi' },
  { name: 'Khulna' },
  { name: 'Barishal' },
  { name: 'Sylhet' },
  { name: 'Rangpur' },
  { name: 'Mymensingh' }
];

export const bangladeshTerritories: Record<string, Omit<Territory, 'id' | 'createdAt' | 'updatedAt'>[]> = {
  'Dhaka': [
    { name: 'Dhaka Metro', regionalId: '' },
    { name: 'Gazipur', regionalId: '' },
    { name: 'Narayanganj', regionalId: '' },
    { name: 'Tangail', regionalId: '' },
    { name: 'Manikganj', regionalId: '' }
  ],
  'Chattogram': [
    { name: 'Chattogram Metro', regionalId: '' },
    { name: 'Coxs Bazar', regionalId: '' },
    { name: 'Comilla', regionalId: '' },
    { name: 'Feni', regionalId: '' },
    { name: 'Noakhali', regionalId: '' }
  ],
  'Rajshahi': [
    { name: 'Rajshahi Metro', regionalId: '' },
    { name: 'Bogura', regionalId: '' },
    { name: 'Pabna', regionalId: '' },
    { name: 'Sirajganj', regionalId: '' },
    { name: 'Natore', regionalId: '' }
  ],
  'Khulna': [
    { name: 'Khulna Metro', regionalId: '' },
    { name: 'Jessore', regionalId: '' },
    { name: 'Kushtia', regionalId: '' },
    { name: 'Satkhira', regionalId: '' },
    { name: 'Bagerhat', regionalId: '' }
  ],
  'Barishal': [
    { name: 'Barishal Metro', regionalId: '' },
    { name: 'Patuakhali', regionalId: '' },
    { name: 'Bhola', regionalId: '' },
    { name: 'Jhalokati', regionalId: '' },
    { name: 'Pirojpur', regionalId: '' }
  ],
  'Sylhet': [
    { name: 'Sylhet Metro', regionalId: '' },
    { name: 'Moulvibazar', regionalId: '' },
    { name: 'Habiganj', regionalId: '' },
    { name: 'Sunamganj', regionalId: '' }
  ],
  'Rangpur': [
    { name: 'Rangpur Metro', regionalId: '' },
    { name: 'Dinajpur', regionalId: '' },
    { name: 'Kurigram', regionalId: '' },
    { name: 'Gaibandha', regionalId: '' },
    { name: 'Lalmonirhat', regionalId: '' }
  ],
  'Mymensingh': [
    { name: 'Mymensingh Metro', regionalId: '' },
    { name: 'Jamalpur', regionalId: '' },
    { name: 'Netrokona', regionalId: '' },
    { name: 'Sherpur', regionalId: '' }
  ]
};

export const bangladeshAreas: Record<string, Omit<Area, 'id' | 'createdAt' | 'updatedAt'>[]> = {
  'Dhaka Metro': [
    { name: 'Dhanmondi', territoryId: '' },
    { name: 'Gulshan', territoryId: '' },
    { name: 'Banani', territoryId: '' },
    { name: 'Old Dhaka', territoryId: '' },
    { name: 'Mirpur', territoryId: '' },
    { name: 'Uttara', territoryId: '' }
  ],
  'Gazipur': [
    { name: 'Gazipur Sadar', territoryId: '' },
    { name: 'Tongi', territoryId: '' },
    { name: 'Kaliakair', territoryId: '' },
    { name: 'Kapasia', territoryId: '' }
  ],
  'Chattogram Metro': [
    { name: 'Chittagong City', territoryId: '' },
    { name: 'Hathazari', territoryId: '' },
    { name: 'Rangunia', territoryId: '' },
    { name: 'Sitakunda', territoryId: '' }
  ],
  'Coxs Bazar': [
    { name: 'Cox\'s Bazar Sadar', territoryId: '' },
    { name: 'Teknaf', territoryId: '' },
    { name: 'Maheshkhali', territoryId: '' },
    { name: 'Ramu', territoryId: '' }
  ],
  'Rajshahi Metro': [
    { name: 'Rajshahi City', territoryId: '' },
    { name: 'Poba', territoryId: '' },
    { name: 'Durgapur', territoryId: '' },
    { name: 'Mohonpur', territoryId: '' }
  ],
  'Khulna Metro': [
    { name: 'Khulna City', territoryId: '' },
    { name: 'Sonadanga', territoryId: '' },
    { name: 'Khalishpur', territoryId: '' },
    { name: 'Daulatpur', territoryId: '' }
  ]
};

// Initialize Bangladesh data in localStorage if not exists
export function initializeBangladeshData() {
  const regionals = JSON.parse(localStorage.getItem('admin_regionals') || '[]');
  const territories = JSON.parse(localStorage.getItem('admin_territories') || '[]');
  const areas = JSON.parse(localStorage.getItem('admin_areas') || '[]');

  // Only initialize if no data exists
  if (regionals.length === 0) {
    const timestamp = now();
    
    // Create regionals
    const createdRegionals = bangladeshRegionals.map(item => ({
      ...item,
      id: uid(),
      createdAt: timestamp,
      updatedAt: timestamp,
    }));
    localStorage.setItem('admin_regionals', JSON.stringify(createdRegionals));

    // Create territories
    const createdTerritories: Territory[] = [];
    createdRegionals.forEach(regional => {
      const territoryData = bangladeshTerritories[regional.name] || [];
      territoryData.forEach(territory => {
        createdTerritories.push({
          ...territory,
          regionalId: regional.id,
          id: uid(),
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });
    });
    localStorage.setItem('admin_territories', JSON.stringify(createdTerritories));

    // Create areas
    const createdAreas: Area[] = [];
    createdTerritories.forEach(territory => {
      const areaData = bangladeshAreas[territory.name] || [];
      areaData.forEach(area => {
        createdAreas.push({
          ...area,
          territoryId: territory.id,
          id: uid(),
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      });
    });
    localStorage.setItem('admin_areas', JSON.stringify(createdAreas));
  }
}