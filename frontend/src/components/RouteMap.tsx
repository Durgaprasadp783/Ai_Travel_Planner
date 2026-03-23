"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, InfoWindow } from "@react-google-maps/api";

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

export default function RouteMap({ places, origin, destination, originCoords, destinationCoords }: RouteMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
        libraries: ["places"]
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [markers, setMarkers] = useState<{ lat: number, lng: number, place: Place, isEndpoint?: boolean }[]>([]);
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

        const startAddr = origin || (validPlaces.length > 0 ? getLocationString(validPlaces[0]) : "");
        const endAddr = destination || (validPlaces.length > 0 ? getLocationString(validPlaces[validPlaces.length - 1]) : "");

        const startCoords = originCoords ? { lat: originCoords[1], lng: originCoords[0] } : null;
        const endCoords = destinationCoords ? { lat: destinationCoords[1], lng: destinationCoords[0] } : null;

        if (!startAddr && !startCoords) return;

        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route(
            {
                origin: startCoords || startAddr || "",
                destination: endCoords || endAddr || "",
                waypoints: validPlaces
                    .filter(p => getLocationString(p) !== startAddr && getLocationString(p) !== endAddr)
                    .slice(0, 20)
                    .map(place => ({
                        location: getLocationString(place),
                        stopover: true
                    })),
                optimizeWaypoints: true,
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
                            place: { name: origin || "Start Point", address: origin || "" },
                            isEndpoint: true
                        });
                        for (let i = 0; i < legs.length; i++) {
                            newMarkers.push({
                                lat: legs[i].end_location.lat(),
                                lng: legs[i].end_location.lng(),
                                place: i === legs.length - 1 ? { name: destination || "Destination", address: destination || "" } : validPlaces[i],
                                isEndpoint: i === legs.length - 1
                            });
                        }
                        setMarkers(newMarkers);
                    }
                } else {
                    console.warn("Directions request failed, using fallback markers:", status);
                    const fallback: any[] = [];
                    if (startCoords) fallback.push({ ...startCoords, place: { name: "Start Point" }, isEndpoint: true });
                    if (endCoords) fallback.push({ ...endCoords, place: { name: "Destination" }, isEndpoint: true });
                    setMarkers(fallback);
                    if (fallback.length > 0) fitBounds(fallback);
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
                    icon={marker.isEndpoint ? {
                        url: i === 0 ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png" : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    } : {
                        url: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                    }}
                    label={!marker.isEndpoint ? {
                        text: String(i),
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "10px"
                    } : undefined}
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
        </GoogleMap>
    );
}
