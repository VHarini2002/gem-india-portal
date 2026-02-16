export type ServiceType = 'Teardown & Return' | 'Teardown, Repair & Sell' | 'Lease Storage';

export type EngineStatus = 'In Transit' | 'In Repair' | 'In Storage' | 'Disassembly' | 'Inspection' | 'Ready for Release' | 'Completed' | 'Preservation Active';

export type UserRole = 'client' | 'kam';

export interface User {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  company?: string;
}

export interface Engine {
  id: string;
  esn: string;
  workOrder: string;
  model: string;
  clientName: string;
  clientEmail: string;
  serviceType: ServiceType;
  status: EngineStatus;
  currentLocation: string;
  modeOfTransport: string;
  progress: number;
  lastUpdated: string;
  inductionDate: string;
  expectedCompletion: string;
  currentPhase: string;
}

export interface Part {
  id: string;
  engineId: string;
  partNumber: string;
  serialNumber: string;
  category: 'Scrap' | 'Repair' | 'Sell';
  condition: string;
  currentLocation: string;
  repairCost?: number;
  eta?: string;
  llpStatus?: string;
  certification?: string;
  stockLocation?: string;
  price?: number;
  saleStatus?: string;
  scrapReason?: string;
  dateScrapped?: string;
}

export interface Shipment {
  id: string;
  engineId: string;
  shipmentId: string;
  fromLocation: string;
  toLocation: string;
  mode: 'Air' | 'Sea' | 'Road';
  carrier: string;
  dispatchDate: string;
  eta: string;
  currentPosition: string;
  etaCompleted: number;
}

export interface FinancialSummary {
  engineId: string;
  totalRevenue: number;
  repairCost: number;
  logisticsCost: number;
  storageCost: number;
  commissionPercent: number;
  commissionAmount: number;
  netPayable: number;
  paymentStatus: string;
}

export const mockUsers: User[] = [
  { email: 'client1@gemindia.com', password: 'Client@123', role: 'client', name: 'Rajesh Kumar', company: 'AeroLease Corp' },
  { email: 'lessor@gemindia.com', password: 'Client@123', role: 'client', name: 'Sarah Mitchell', company: 'Global Lessors Inc' },
  { email: 'teardown@gemindia.com', password: 'Client@123', role: 'client', name: 'David Chen', company: 'TechJet Aviation' },
  { email: 'kam@gemindia.com', password: 'KAM@123', role: 'kam', name: 'Priya Sharma' },
];

const locations = ['Chennai, India', 'Singapore', 'Dubai, UAE', 'London, UK', 'Miami, USA', 'Frankfurt, Germany'];
const engineModels = ['CFM56-5B', 'CFM56-7B', 'V2500-A5', 'PW1100G', 'LEAP-1A', 'CF34-10E'];
const carriers = ['DHL Aviation', 'FedEx Cargo', 'Maersk Line', 'Emirates SkyCargo', 'DB Schenker', 'Kuehne+Nagel'];

const teardownPhases = ['Pickup', 'Transit', 'Received', 'Records Review', 'Disassembly', 'Inspection', 'Repair', 'Sale', 'Closed'];
const storagePhases = ['Collected', 'Transit', 'Stored', 'Preservation Active', 'Ready for Release'];

export const getPhases = (serviceType: ServiceType) => {
  if (serviceType === 'Lease Storage') return storagePhases;
  return teardownPhases;
};

export const mockEngines: Engine[] = [
  { id: '1', esn: 'ESN-726481', workOrder: 'WO-2024-001', model: 'CFM56-5B', clientName: 'AeroLease Corp', clientEmail: 'client1@gemindia.com', serviceType: 'Teardown, Repair & Sell', status: 'Disassembly', currentLocation: 'Chennai, India', modeOfTransport: 'Air', progress: 45, lastUpdated: '2024-12-15', inductionDate: '2024-09-01', expectedCompletion: '2025-03-15', currentPhase: 'Disassembly' },
  { id: '2', esn: 'ESN-839205', workOrder: 'WO-2024-002', model: 'V2500-A5', clientName: 'AeroLease Corp', clientEmail: 'client1@gemindia.com', serviceType: 'Teardown & Return', status: 'In Transit', currentLocation: 'Singapore', modeOfTransport: 'Sea', progress: 25, lastUpdated: '2024-12-14', inductionDate: '2024-10-15', expectedCompletion: '2025-04-01', currentPhase: 'Transit' },
  { id: '3', esn: 'ESN-451923', workOrder: 'WO-2024-003', model: 'PW1100G', clientName: 'Global Lessors Inc', clientEmail: 'lessor@gemindia.com', serviceType: 'Lease Storage', status: 'In Storage', currentLocation: 'Chennai, India', modeOfTransport: 'Road', progress: 60, lastUpdated: '2024-12-13', inductionDate: '2024-06-01', expectedCompletion: '2025-06-01', currentPhase: 'Preservation Active' },
  { id: '4', esn: 'ESN-672314', workOrder: 'WO-2024-004', model: 'CFM56-7B', clientName: 'Global Lessors Inc', clientEmail: 'lessor@gemindia.com', serviceType: 'Teardown, Repair & Sell', status: 'Inspection', currentLocation: 'Chennai, India', modeOfTransport: 'Air', progress: 55, lastUpdated: '2024-12-12', inductionDate: '2024-08-15', expectedCompletion: '2025-02-28', currentPhase: 'Inspection' },
  { id: '5', esn: 'ESN-198734', workOrder: 'WO-2024-005', model: 'LEAP-1A', clientName: 'TechJet Aviation', clientEmail: 'teardown@gemindia.com', serviceType: 'Teardown & Return', status: 'In Repair', currentLocation: 'Dubai, UAE', modeOfTransport: 'Air', progress: 70, lastUpdated: '2024-12-11', inductionDate: '2024-07-01', expectedCompletion: '2025-01-30', currentPhase: 'Repair' },
  { id: '6', esn: 'ESN-564218', workOrder: 'WO-2024-006', model: 'CF34-10E', clientName: 'TechJet Aviation', clientEmail: 'teardown@gemindia.com', serviceType: 'Lease Storage', status: 'Preservation Active', currentLocation: 'Chennai, India', modeOfTransport: 'Road', progress: 40, lastUpdated: '2024-12-10', inductionDate: '2024-04-01', expectedCompletion: '2025-04-01', currentPhase: 'Stored' },
  { id: '7', esn: 'ESN-387456', workOrder: 'WO-2024-007', model: 'CFM56-5B', clientName: 'AeroLease Corp', clientEmail: 'client1@gemindia.com', serviceType: 'Teardown, Repair & Sell', status: 'Completed', currentLocation: 'Chennai, India', modeOfTransport: 'Air', progress: 100, lastUpdated: '2024-12-09', inductionDate: '2024-03-01', expectedCompletion: '2024-11-30', currentPhase: 'Closed' },
  { id: '8', esn: 'ESN-921567', workOrder: 'WO-2024-008', model: 'V2500-A5', clientName: 'Global Lessors Inc', clientEmail: 'lessor@gemindia.com', serviceType: 'Lease Storage', status: 'In Storage', currentLocation: 'Singapore', modeOfTransport: 'Sea', progress: 50, lastUpdated: '2024-12-08', inductionDate: '2024-05-15', expectedCompletion: '2025-05-15', currentPhase: 'Stored' },
  { id: '9', esn: 'ESN-743892', workOrder: 'WO-2024-009', model: 'PW1100G', clientName: 'TechJet Aviation', clientEmail: 'teardown@gemindia.com', serviceType: 'Teardown, Repair & Sell', status: 'In Transit', currentLocation: 'London, UK', modeOfTransport: 'Air', progress: 15, lastUpdated: '2024-12-07', inductionDate: '2024-11-01', expectedCompletion: '2025-05-01', currentPhase: 'Transit' },
  { id: '10', esn: 'ESN-156723', workOrder: 'WO-2024-010', model: 'CFM56-7B', clientName: 'AeroLease Corp', clientEmail: 'client1@gemindia.com', serviceType: 'Teardown & Return', status: 'Disassembly', currentLocation: 'Chennai, India', modeOfTransport: 'Road', progress: 35, lastUpdated: '2024-12-06', inductionDate: '2024-09-15', expectedCompletion: '2025-03-01', currentPhase: 'Disassembly' },
  { id: '11', esn: 'ESN-482916', workOrder: 'WO-2024-011', model: 'LEAP-1A', clientName: 'Global Lessors Inc', clientEmail: 'lessor@gemindia.com', serviceType: 'Teardown, Repair & Sell', status: 'In Repair', currentLocation: 'Frankfurt, Germany', modeOfTransport: 'Air', progress: 65, lastUpdated: '2024-12-05', inductionDate: '2024-07-15', expectedCompletion: '2025-02-15', currentPhase: 'Repair' },
  { id: '12', esn: 'ESN-635174', workOrder: 'WO-2024-012', model: 'CF34-10E', clientName: 'TechJet Aviation', clientEmail: 'teardown@gemindia.com', serviceType: 'Lease Storage', status: 'Ready for Release', currentLocation: 'Miami, USA', modeOfTransport: 'Sea', progress: 90, lastUpdated: '2024-12-04', inductionDate: '2024-02-01', expectedCompletion: '2025-01-15', currentPhase: 'Ready for Release' },
];

// Generate parts
const partPrefixes = ['PN-73', 'PN-56', 'PN-81', 'PN-42', 'PN-95', 'PN-67', 'PN-38', 'PN-14'];
const conditions = ['Serviceable', 'As-Removed', 'Overhauled', 'New', 'Inspected'];
const scrapReasons = ['Beyond Repair', 'Life Limited', 'Corrosion Damage', 'Fatigue Crack', 'Obsolete'];
const certifications = ['EASA', 'FAA', 'Dual Release', 'CAAC'];

export const mockParts: Part[] = [];
let partId = 1;
mockEngines.forEach(engine => {
  const count = engine.serviceType === 'Lease Storage' ? 20 : 125;
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    const category: Part['category'] = rand < 0.33 ? 'Scrap' : rand < 0.58 ? 'Repair' : 'Sell';
    mockParts.push({
      id: String(partId++),
      engineId: engine.id,
      partNumber: `${partPrefixes[Math.floor(Math.random() * partPrefixes.length)]}${String(Math.floor(Math.random() * 9000) + 1000)}`,
      serialNumber: `SN-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      category,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      currentLocation: locations[Math.floor(Math.random() * locations.length)],
      repairCost: category === 'Repair' ? Math.floor(Math.random() * 50000) + 5000 : undefined,
      eta: category === 'Repair' ? '2025-02-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') : undefined,
      llpStatus: category === 'Sell' ? (Math.random() > 0.5 ? 'LLP' : 'Non-LLP') : undefined,
      certification: category === 'Sell' ? certifications[Math.floor(Math.random() * certifications.length)] : undefined,
      stockLocation: category === 'Sell' ? locations[Math.floor(Math.random() * locations.length)] : undefined,
      price: category === 'Sell' ? Math.floor(Math.random() * 100000) + 10000 : undefined,
      saleStatus: category === 'Sell' ? (Math.random() > 0.5 ? 'Available' : 'Sold') : undefined,
      scrapReason: category === 'Scrap' ? scrapReasons[Math.floor(Math.random() * scrapReasons.length)] : undefined,
      dateScrapped: category === 'Scrap' ? '2024-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 28) + 1).padStart(2, '0') : undefined,
    });
  }
});

export const mockShipments: Shipment[] = mockEngines.map((engine, i) => ({
  id: String(i + 1),
  engineId: engine.id,
  shipmentId: `SHP-2024-${String(i + 1).padStart(4, '0')}`,
  fromLocation: locations[i % locations.length],
  toLocation: locations[(i + 2) % locations.length],
  mode: (['Air', 'Sea', 'Road'] as const)[i % 3],
  carrier: carriers[i % carriers.length],
  dispatchDate: `2024-${String(Math.floor(Math.random() * 3) + 10).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  eta: `2025-${String(Math.floor(Math.random() * 3) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  currentPosition: engine.currentLocation,
  etaCompleted: Math.floor(Math.random() * 80) + 10,
}));

export const mockFinancials: FinancialSummary[] = mockEngines
  .filter(e => e.serviceType !== 'Lease Storage')
  .map(engine => {
    const totalRevenue = Math.floor(Math.random() * 5000000) + 1000000;
    const repairCost = Math.floor(totalRevenue * 0.2);
    const logisticsCost = Math.floor(totalRevenue * 0.05);
    const storageCost = Math.floor(totalRevenue * 0.03);
    const commissionPercent = 8;
    const commissionAmount = Math.floor(totalRevenue * 0.08);
    return {
      engineId: engine.id,
      totalRevenue,
      repairCost,
      logisticsCost,
      storageCost,
      commissionPercent,
      commissionAmount,
      netPayable: totalRevenue - repairCost - logisticsCost - storageCost - commissionAmount,
      paymentStatus: Math.random() > 0.5 ? 'Paid' : 'Pending',
    };
  });
