"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, InfoWindow, Polyline } from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "100%",
    minHeight: "400px",
    borderRadius: "1rem"
};

const defaultCenter = {
    lat: 35.6762,
    lng: 139.6503
};

interface Place {
    location?: string;
    address?: string;
    description?: string;
    name?: string;
}

interface RouteMapProps {
    places: Place[];
    flights?: any[];
    origin?: string;
    destination?: string;
    originCoords?: [number, number]; // [lng, lat]
    destinationCoords?: [number, number]; // [lng, lat]
}

const mapDarkTheme = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

export default function RouteMap({ places, flights, origin, destination, originCoords, destinationCoords }: RouteMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
        libraries: ["places"]
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [markers, setMarkers] = useState<{ lat: number, lng: number, place: Place, isEndpoint?: boolean, index?: number }[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<{ lat: number, lng: number, place: Place } | null>(null);
    const [placeDetails, setPlaceDetails] = useState<any>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const fitBounds = useCallback((points: { lat: number, lng: number }[]) => {
        if (!mapRef.current || !window.google || points.length === 0) return;
        const bounds = new window.google.maps.LatLngBounds();
        points.forEach(p => bounds.extend(p));
        mapRef.current.fitBounds(bounds);
        if (points.length === 1) mapRef.current.setZoom(12);
    }, []);

    const calculateRoute = useCallback(() => {
        if (!window.google || !isLoaded) return;

        const getLocationString = (p: Place) => p.location || p.address || p.name || p.description || "";
        const validPlaces = (places || []).filter(p => getLocationString(p).trim() !== "");

        const getConstrainedLocation = (loc: string) => {
             if (!loc) return "";
             if (destination && !loc.toLowerCase().includes(destination.toLowerCase())) {
                 return `${loc}, ${destination}`;
             }
             return loc;
        };

        let startAddr = origin || "";
        let endAddr = destination || "";

        if (!startAddr && validPlaces.length > 0) {
             startAddr = getConstrainedLocation(getLocationString(validPlaces[0]));
             endAddr = getConstrainedLocation(getLocationString(validPlaces[validPlaces.length - 1]));
        }

        if (!startAddr) return;

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: startAddr,
                destination: endAddr,
                waypoints: [],
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);
                    const legs = result.routes[0].legs;
                    const newMarkers: any[] = [];

                    if (legs.length > 0) {
                        newMarkers.push({
                            lat: legs[0].start_location.lat(),
                            lng: legs[0].start_location.lng(),
                            place: { name: startAddr || "Origin", address: startAddr || "" },
                            isEndpoint: true,
                            index: 1
                        });
                        newMarkers.push({
                            lat: legs[legs.length - 1].end_location.lat(),
                            lng: legs[legs.length - 1].end_location.lng(),
                            place: { name: endAddr || "Destination", address: endAddr || "" },
                            isEndpoint: true,
                            index: 2
                        });
                        setMarkers(newMarkers);
                    }
                } else {
                    console.warn("Directions request failed:", status);
                    setMarkers([]);
                }
            }
        );
    }, [places, origin, destination, originCoords, destinationCoords, isLoaded, fitBounds]);

    useEffect(() => {
        if (isLoaded) calculateRoute();
    }, [isLoaded, calculateRoute]);

    const handleMarkerClick = (markerData: any) => {
        setSelectedMarker(markerData);
        setPlaceDetails(null);
        if (!mapRef.current || !window.google) return;
        const service = new window.google.maps.places.PlacesService(mapRef.current);
        const query = markerData.place.name || markerData.place.location || markerData.place.address || "";
        if (!query) return;
        service.findPlaceFromQuery(
            { query: query, fields: ['place_id'] },
            (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0].place_id) {
                    service.getDetails(
                        { placeId: results[0].place_id, fields: ['name', 'rating', 'photos', 'opening_hours', 'formatted_address'] },
                        (placeResult, detailStatus) => {
                            if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) setPlaceDetails(placeResult);
                        }
                    );
                }
            }
        );
    };

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        mapRef.current = map;
        if (markers.length > 0) fitBounds(markers);
    }, [markers, fitBounds]);

    if (!isLoaded) return <div className="w-full h-full min-h-[400px] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-white/50">Loading Map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={4}
            onLoad={onLoad}
            options={{
                styles: mapDarkTheme,
                disableDefaultUI: false,
                zoomControl: true,
            }}
        >
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{ suppressMarkers: true, preserveViewport: false }}
                />
            )}

            {markers.map((marker, i) => (
                <Marker
                    key={i}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={() => handleMarkerClick(marker)}
                    icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    }}
                    label={{
                        text: String(marker.index || (i + 1)),
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "10px"
                    }}
                />
            ))}

            {selectedMarker && (
                <InfoWindow
                    position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                    onCloseClick={() => {
                        setSelectedMarker(null);
                        setPlaceDetails(null);
                    }}
                >
                    <div className="p-1 max-w-[200px] text-black">
                        <h3 className="font-bold text-[14px] mb-1">{selectedMarker.place.name || selectedMarker.place.location}</h3>
                        {placeDetails ? (
                            <div className="flex flex-col gap-1 text-[12px]">
                                {placeDetails.photos && placeDetails.photos.length > 0 && (
                                    <img src={placeDetails.photos[0].getUrl({ maxWidth: 200, maxHeight: 150 })} alt="Place" className="w-full h-[100px] object-cover rounded-lg mb-1" />
                                )}
                                {placeDetails.rating && <div className="flex items-center gap-1">⭐ {placeDetails.rating}</div>}
                                {placeDetails.formatted_address && <div className="text-gray-600 truncate">{placeDetails.formatted_address}</div>}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-[12px]">Loading details...</div>
                        )}
                    </div>
                </InfoWindow>
            )}

            {(flights || []).map((flight: any, i: number) => {
                const dep_lat = flight.dep_lat;
                const dep_lng = flight.dep_lng;
                const arr_lat = flight.arr_lat;
                const arr_lng = flight.arr_lng;
                
                if (!dep_lat || !arr_lat) return null;
                return (
                    <Polyline
                        key={`flight-${i}`}
                        path={[
                            { lat: dep_lat, lng: dep_lng },
                            { lat: arr_lat, lng: arr_lng }
                        ]}
                        options={{ strokeColor: "#FF0000", geodesic: true, strokeWeight: 3, strokeOpacity: 0.8 }}
                    />
                );
            })}
        </GoogleMap>
    );
}
