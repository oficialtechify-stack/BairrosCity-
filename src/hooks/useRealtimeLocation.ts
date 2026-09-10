import { useState, useEffect, useRef, useCallback } from 'react';
import { UserLocation } from '../types';

export interface UseRealtimeLocationReturn {
  userLocation: UserLocation | null;
  isTracking: boolean;
  isFollowing: boolean;
  setIsFollowing: (val: boolean) => void;
  markerStyle: 'arrow' | 'pegman';
  setMarkerStyle: (style: 'arrow' | 'pegman') => void;
  deviceHeading: number | null;
  startTracking: () => void;
  stopTracking: () => void;
  recenter: () => void;
  setUserLocation: (loc: UserLocation | null) => void;
}

const DEFAULT_INITIAL_LOCATION: UserLocation = {
  lat: -8.0645,
  lng: -34.9855,
  name: 'Você está aqui (Curado IV)',
  accuracy: 15,
  heading: 0,
  isRealTime: true,
};

export function useRealtimeLocation(
  onLocationUpdate?: (loc: UserLocation) => void
): UseRealtimeLocationReturn {
  // Always initialize with default location so the user marker is NEVER missing!
  const [userLocation, setUserLocation] = useState<UserLocation | null>(DEFAULT_INITIAL_LOCATION);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const [markerStyle, setMarkerStyle] = useState<'arrow' | 'pegman'>('arrow');
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // 1. Device Orientation (compass heading when holding/turning phone)
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let compassHeading: number | null = null;

      // iOS compass heading
      if ('webkitCompassHeading' in event && typeof (event as any).webkitCompassHeading === 'number') {
        compassHeading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android standard compass (alpha is counter-clockwise, convert to clockwise 0-360)
        compassHeading = (360 - event.alpha) % 360;
      }

      if (compassHeading !== null) {
        setDeviceHeading(compassHeading);
        setUserLocation((prev) => {
          if (!prev) return prev;
          return { ...prev, heading: compassHeading };
        });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // 2. Real-time GPS watchPosition
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocalização não suportada pelo navegador');
      return;
    }

    setIsTracking(true);
    setIsFollowing(true);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Immediate single fix for speed
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const heading = pos.coords.heading ?? deviceHeading ?? 0;
        const newLoc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Você está aqui (Tempo Real)',
          accuracy: pos.coords.accuracy,
          heading: heading,
          speed: pos.coords.speed,
          isRealTime: true,
        };
        setUserLocation(newLoc);
        onLocationUpdate?.(newLoc);
      },
      (err) => {
        console.warn('GPS instantâneo aviso:', err.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const heading = pos.coords.heading ?? deviceHeading ?? 0;
        const newLoc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Você está aqui (Tempo Real)',
          accuracy: pos.coords.accuracy,
          heading: heading,
          speed: pos.coords.speed,
          isRealTime: true,
        };

        setUserLocation(newLoc);
        onLocationUpdate?.(newLoc);
      },
      (err) => {
        console.warn('Aguardando ou negada permissão de GPS:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 20000,
      }
    );
  }, [deviceHeading, onLocationUpdate]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // 3. Recenter and re-enable auto follow
  const recenter = useCallback(() => {
    setIsFollowing(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const heading = pos.coords.heading ?? deviceHeading ?? 0;
          const newLoc: UserLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'Você está aqui (Tempo Real)',
            accuracy: pos.coords.accuracy,
            heading: heading,
            speed: pos.coords.speed,
            isRealTime: true,
          };
          setUserLocation(newLoc);
          onLocationUpdate?.(newLoc);
        },
        (err) => console.warn('GPS recenter aviso:', err.message),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
    if (!isTracking) {
      startTracking();
    } else if (userLocation) {
      onLocationUpdate?.(userLocation);
    }
  }, [isTracking, startTracking, userLocation, onLocationUpdate, deviceHeading]);

  // Auto-start real-time GPS tracking on mount if available
  useEffect(() => {
    if (navigator.geolocation) {
      startTracking();
    }
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);

  return {
    userLocation,
    isTracking,
    isFollowing,
    setIsFollowing,
    markerStyle,
    setMarkerStyle,
    deviceHeading,
    startTracking,
    stopTracking,
    recenter,
    setUserLocation,
  };
}
