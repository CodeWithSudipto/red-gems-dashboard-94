import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { useUIStore } from '@/store';

interface GoogleMapsLocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string };
}

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with actual API key

export function GoogleMapsLocationPicker({ onLocationSelect, initialLocation }: GoogleMapsLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchAddress, setSearchAddress] = useState(initialLocation?.address || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY');
  const [apiKey, setApiKey] = useState('');
  const { addToast } = useUIStore();

  useEffect(() => {
    if (!showApiKeyInput && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      loadGoogleMaps(GOOGLE_MAPS_API_KEY);
    }
  }, [showApiKeyInput]);

  const loadGoogleMaps = async (key: string) => {
    try {
      const loader = new Loader({
        apiKey: key,
        version: 'weekly',
        libraries: ['places'],
      });

      await loader.load();
      setIsLoaded(true);
      initializeMap();
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      addToast({ message: 'Failed to load Google Maps. Please check your API key.', type: 'error' });
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    const defaultLocation = initialLocation 
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : { lat: 23.8103, lng: 90.4125 }; // Dhaka, Bangladesh

    const map = new google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    mapInstanceRef.current = map;

    // Create marker
    const marker = new google.maps.Marker({
      position: defaultLocation,
      map: map,
      draggable: true,
      title: 'Selected Location',
    });

    markerRef.current = marker;

    // Add click listener to map
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        updateMarkerPosition(lat, lng);
      }
    });

    // Add drag listener to marker
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        updateMarkerPosition(position.lat(), position.lng());
      }
    });

    // Initialize autocomplete
    if (searchInputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: 'BD' }, // Restrict to Bangladesh
        fields: ['geometry', 'formatted_address'],
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || '';
          
          updateMarkerPosition(lat, lng);
          setSearchAddress(address);
          map.setCenter({ lat, lng });
        }
      });
    }

    // Set initial location if provided
    if (initialLocation) {
      onLocationSelect(initialLocation);
    }
  };

  const updateMarkerPosition = (lat: number, lng: number) => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    }

    // Reverse geocoding to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const address = results[0].formatted_address;
        setSearchAddress(address);
        onLocationSelect({ lat, lng, address });
      } else {
        onLocationSelect({ lat, lng, address: `${lat}, ${lng}` });
      }
    });
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      loadGoogleMaps(apiKey.trim());
      setShowApiKeyInput(false);
    } else {
      addToast({ message: 'Please enter a valid Google Maps API key', type: 'error' });
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 text-orange-600">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">Google Maps API Key Required</span>
        </div>
        <p className="text-sm text-muted-foreground">
          To use the location picker, please enter your Google Maps API key. 
          You can get one from the Google Cloud Console.
        </p>
        <div className="space-y-2">
          <Label htmlFor="apiKey">Google Maps API Key</Label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Maps API key"
            />
            <Button onClick={handleApiKeySubmit} size="sm">
              Load Map
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>For now, you can manually enter coordinates in the format: "lat,lng" (e.g., "23.8103,90.4125")</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="search">Search Location</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="search"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Search for a location..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border bg-muted"
          style={{ minHeight: '256px' }}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Click on the map or drag the marker to select a location. You can also search for an address above.
      </p>
    </div>
  );
}