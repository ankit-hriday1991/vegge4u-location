import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import ShopCard from './components/ShopCard';
import VegetableFilters from './components/VegetableFilters';
import { Search } from 'lucide-react';
import { useLocation } from './hooks/useLocation';
import { calculateDistance } from './utils/distance';
import LocationPrompt from './components/LocationPrompt';

// ... (keep all existing interfaces)

function App() {
  const [shops] = useState<Shop[]>([ /* ... keep existing shops data ... */ ]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const { 
    sortedShops, 
    searchedVegetable, 
    averageVegetablePrice, 
    uniqueVegetables 
  } = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Calculate average price and distance for each shop
    const shopsWithMetrics = shops.map(shop => {
      const mandatoryVegetables = shop.vegetables.filter(v => v.category === 'mandatory');
      const avgPrice = mandatoryVegetables.reduce((acc, v) => acc + v.price, 0) / mandatoryVegetables.length;
      
      let distance = 0;
      if (!location.error && !location.loading) {
        distance = calculateDistance(
          location.latitude,
          location.longitude,
          shop.location.lat,
          shop.location.lng
        );
      }
      
      return { ...shop, averagePrice: avgPrice, distance };
    });

    // Sort shops by distance if location is available, otherwise by price
    const sorted = [...shopsWithMetrics].sort((a, b) => {
      if (!location.error && !location.loading) {
        return a.distance - b.distance;
      }
      return a.averagePrice - b.averagePrice;
    });

    // Rest of the filtering logic remains the same
    const allVegetables = new Set<string>();
    shops.forEach(shop => {
      shop.vegetables.forEach(veg => allVegetables.add(veg.name));
    });

    const matchingVegetable = shops.some(shop => 
      shop.vegetables.some(veg => veg.name.toLowerCase() === normalizedSearch)
    ) ? normalizedSearch : null;

    const filtered = sorted.filter(shop => {
      if (!normalizedSearch) return true;
      
      if (matchingVegetable) {
        return shop.vegetables.some(veg => 
          veg.name.toLowerCase() === matchingVegetable
        );
      }
      
      return (
        shop.name.toLowerCase().includes(normalizedSearch) ||
        shop.vegetables.some(veg => 
          veg.name.toLowerCase().includes(normalizedSearch)
        )
      );
    });

    let avgVegPrice = 0;
    if (matchingVegetable) {
      const prices = filtered.map(shop => 
        shop.vegetables.find(v => v.name.toLowerCase() === matchingVegetable)?.price ?? 0
      );
      avgVegPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    }

    return {
      sortedShops: filtered,
      searchedVegetable: matchingVegetable,
      averageVegetablePrice: avgVegPrice,
      uniqueVegetables: Array.from(allVegetables).sort()
    };
  }, [shops, searchTerm, location]);

  const handleVegetableSelect = (vegetable: string) => {
    setSearchTerm(searchTerm === vegetable ? '' : vegetable);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        averagePrice={sortedShops[0]?.averagePrice ?? 0}
        searchedVegetable={searchedVegetable}
        averageVegetablePrice={averageVegetablePrice}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="py-8">
          {location.loading ? (
            <LocationPrompt status="loading" />
          ) : location.error ? (
            <LocationPrompt status="error" error={location.error} />
          ) : (
            <LocationPrompt status="success" />
          )}

          <div className="relative max-w-xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search shops or vegetables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <VegetableFilters
            vegetables={uniqueVegetables}
            onSelect={handleVegetableSelect}
            selectedVegetable={searchedVegetable}
          />

          {searchedVegetable && (
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Showing shops selling {searchedVegetable.charAt(0).toUpperCase() + searchedVegetable.slice(1)}
              </h2>
              <p className="text-gray-600 mt-1">
                Found {sortedShops.length} shop{sortedShops.length !== 1 ? 's' : ''} with this vegetable
              </p>
              <p className="text-green-600 font-medium mt-1">
                Average price: ₹{averageVegetablePrice}/KG
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {sortedShops.map((shop) => (
              <ShopCard
                key={shop.id}
                name={shop.name}
                averagePrice={shop.averagePrice}
                image={shop.image}
                location={shop.location}
                vegetables={shop.vegetables}
                distance={shop.distance}
                userLocation={{
                  latitude: location.latitude,
                  longitude: location.longitude
                }}
                highlightedVegetable={searchedVegetable}
                averageVegetablePrice={averageVegetablePrice}
              />
            ))}
          </div>

          {sortedShops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No shops found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;