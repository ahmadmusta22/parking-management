import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useParkingStore = create(
  persist(
    (set, get) => ({
      // Gate and zone data
      gates: [],
      zones: [],
      categories: [],
      
      // Current gate context
      currentGate: null,
      currentGateZones: [],
      
      // WebSocket connection status
      wsConnected: false,
      wsError: null,
      
      // Offline caching
      offlineMode: false,
      lastUpdateTime: null,
      cachedZoneStates: {},
      pendingUpdates: [],
      
      // Admin audit log
      adminAuditLog: [],
  
  // Loading states
  loading: {
    gates: false,
    zones: false,
    categories: false
  },
  
  // Error states
  errors: {
    gates: null,
    zones: null,
    categories: null
  },

  // Actions
  setGates: (gates) => set({ gates }),
  
  setZones: (zones) => {
    // console.log('Parking store: Setting zones:', zones);
    set({ zones });
    // Update current gate zones if we have a current gate
    const { currentGate } = get();
    // console.log('Parking store: Current gate:', currentGate);
    if (currentGate) {
      const gateZones = zones.filter(zone => 
        zone.gateIds && zone.gateIds.includes(currentGate.id)
      );
      // console.log('Parking store: Filtered gate zones:', gateZones);
      set({ currentGateZones: gateZones });
    }
  },
  
  setCategories: (categories) => set({ categories }),
  
  setCurrentGate: (gate) => {
    set({ currentGate: gate });
    // Filter zones for current gate
    const { zones } = get();
    const gateZones = zones.filter(zone => 
      gate && zone.gateIds && zone.gateIds.includes(gate.id)
    );
    set({ currentGateZones: gateZones });
  },
  
  updateZone: (updatedZone) => {
    const { zones, currentGateZones, offlineMode, cachedZoneStates } = get();
    
    // Cache the zone state for offline mode
    const zoneCache = {
      ...cachedZoneStates,
      [updatedZone.id]: {
        ...updatedZone,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Update in main zones array
    const updatedZones = zones.map(zone => 
      zone.id === updatedZone.id ? updatedZone : zone
    );
    
    // Update in current gate zones if applicable
    const updatedCurrentGateZones = currentGateZones.map(zone => 
      zone.id === updatedZone.id ? updatedZone : zone
    );
    
    set({ 
      zones: updatedZones,
      currentGateZones: updatedCurrentGateZones,
      cachedZoneStates: zoneCache,
      lastUpdateTime: new Date().toISOString()
    });
  },
  
  setWSConnected: (connected) => {
    const { offlineMode, pendingUpdates } = get();
    
    set({ wsConnected: connected });
    
    // If reconnected, process pending updates
    if (connected && offlineMode && pendingUpdates.length > 0) {
      // console.log('Processing pending updates:', pendingUpdates.length);
      // In a real implementation, you would send these to the server
      set({ 
        offlineMode: false,
        pendingUpdates: []
      });
    }
  },
  
  setWSError: (error) => set({ wsError: error }),
  
  setOfflineMode: (offline) => {
    const { wsConnected } = get();
    set({ 
      offlineMode: offline || !wsConnected,
      lastUpdateTime: new Date().toISOString()
    });
  },
  
  addPendingUpdate: (update) => {
    const { pendingUpdates } = get();
    const newUpdate = {
      ...update,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    
    set({ 
      pendingUpdates: [...pendingUpdates, newUpdate].slice(-20) // Keep last 20 updates
    });
  },
  
  getCachedZoneState: (zoneId) => {
    const { cachedZoneStates } = get();
    return cachedZoneStates[zoneId] || null;
  },
  
  isDataStale: (maxAgeMinutes = 5) => {
    const { lastUpdateTime } = get();
    if (!lastUpdateTime) return true;
    
    const now = new Date();
    const lastUpdate = new Date(lastUpdateTime);
    const diffMinutes = (now - lastUpdate) / (1000 * 60);
    
    return diffMinutes > maxAgeMinutes;
  },
  
  addAdminAuditEntry: (entry) => {
    console.log('addAdminAuditEntry called with:', entry);
    const { adminAuditLog } = get();
    console.log('Current adminAuditLog:', adminAuditLog);
    
    const newEntry = {
      ...entry,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    
    console.log('New audit entry:', newEntry);
    
    // Keep only last 50 entries
    const updatedLog = [newEntry, ...adminAuditLog].slice(0, 50);
    console.log('Updated audit log:', updatedLog);
    
    set({ adminAuditLog: updatedLog });
    console.log('Audit log updated in store');
  },
  
  clearAdminAuditLog: () => {
    set({ adminAuditLog: [] });
  },
  
  setLoading: (key, loading) => {
    const { loading: currentLoading } = get();
    set({ 
      loading: { 
        ...currentLoading, 
        [key]: loading 
      } 
    });
  },
  
  setError: (key, error) => {
    const { errors: currentErrors } = get();
    set({ 
      errors: { 
        ...currentErrors, 
        [key]: error 
      } 
    });
  },
  
  clearErrors: () => set({ 
    errors: { 
      gates: null, 
      zones: null, 
      categories: null 
    } 
  }),
  
  // Reset store
  reset: () => set({
    gates: [],
    zones: [],
    categories: [],
    currentGate: null,
    currentGateZones: [],
    wsConnected: false,
    wsError: null,
    offlineMode: false,
    lastUpdateTime: null,
    cachedZoneStates: {},
    pendingUpdates: [],
    adminAuditLog: [],
    loading: {
      gates: false,
      zones: false,
      categories: false
    },
    errors: {
      gates: null,
      zones: null,
      categories: null
    }
  })
}),
{
  name: 'parking-store',
  partialize: (state) => ({
    // Only persist essential data for offline mode
    gates: state.gates,
    zones: state.zones,
    categories: state.categories,
    cachedZoneStates: state.cachedZoneStates,
    lastUpdateTime: state.lastUpdateTime,
    offlineMode: state.offlineMode
  })
}
));

export default useParkingStore;
