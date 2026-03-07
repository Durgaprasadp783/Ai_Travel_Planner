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
}

export default function RouteMap({ places }: RouteMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
        libraries: ["places"] // Needed for place details
    });

    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [markers, setMarkers] = useState<{ lat: number, lng: number, place: Place }[]>([]);
    const [selectedMarker, setSelectedMarker] = useState<{ lat: number, lng: number, place: Place } | null>(null);
    const [placeDetails, setPlaceDetails] = useState<any>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const calculateRoute = useCallback(() => {
        if (!places || places.length < 2 || !window.google) return;

        const directionsService = new window.google.maps.DirectionsService();

        const getLocationString = (p: Place) => p.location || p.address || p.name || p.description || "";
        const validPlaces = places.filter(p => getLocationString(p).trim() !== "");
        if (validPlaces.length < 2) return;

        const origin = getLocationString(validPlaces[0]);
        const destination = getLocationString(validPlaces[validPlaces.length - 1]);

        const waypoints = validPlaces.slice(1, -1).slice(0, 20).map(place => ({
            location: getLocationString(place),
            stopover: true
        }));

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                waypoints: waypoints,
                optimizeWaypoints: true,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);

                    // Extract coordinates for markers from the route legs so we don't have to geocode them!
                    const legs = result.routes[0].legs;
                    const newMarkers: { lat: number, lng: number, place: Place }[] = [];

                    if (legs.length > 0) {
                        // Origin
                        newMarkers.push({
                            lat: legs[0].start_location.lat(),
                            lng: legs[0].start_location.lng(),
                            place: validPlaces[0]
                        });
                        // Waypoints and Destination
                        for (let i = 0; i < legs.length; i++) {
                            // The end of each leg corresponds to waypoint i, or the destination if it's the last leg
                            newMarkers.push({
                                lat: legs[i].end_location.lat(),
                                lng: legs[i].end_location.lng(),
                                place: validPlaces[i + 1]
                            });
                        }
                        setMarkers(newMarkers);
                    }
                } else {
                    console.warn("Directions request failed:", status);
                }
            }
        );
    }, [places]);

    useEffect(() => {
        if (isLoaded) calculateRoute();
    }, [isLoaded, calculateRoute]);

    const handleMarkerClick = (markerData: { lat: number, lng: number, place: Place }) => {
        setSelectedMarker(markerData);
        setPlaceDetails(null); // reset while loading

        if (!mapRef.current || !window.google) return;

        const service = new window.google.maps.places.PlacesService(mapRef.current);

        // Find the place ID first using text search
        const query = markerData.place.name || markerData.place.location || markerData.place.address || "";
        if (!query) return;

        service.findPlaceFromQuery(
            { query: query, fields: ['place_id'] },
            (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results[0].place_id) {
                    // Then get details
                    service.getDetails(
                        { placeId: results[0].place_id, fields: ['name', 'rating', 'photos', 'opening_hours', 'formatted_address'] },
                        (placeResult, detailStatus) => {
                            if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                                setPlaceDetails(placeResult);
                            }
                        }
                    );
                }
            }
        );
    };

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        mapRef.current = map;
    }, []);

    if (!isLoaded) return <div className="w-full h-full min-h-[400px] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-white/50">Loading Map...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={4}
            onLoad={onLoad}
        >
            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{ suppressMarkers: true, preserveViewport: true }}
                />
            )}

            {markers.map((marker, i) => (
                <Marker
                    key={i}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={() => handleMarkerClick(marker)}
                    label={{
                        text: String(i + 1),
                        color: "white",
                        fontWeight: "bold"
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
                                    <img
                                        src={placeDetails.photos[0].getUrl({ maxWidth: 200, maxHeight: 150 })}
                                        alt="Place"
                                        className="w-full h-[100px] object-cover rounded-lg mb-1"
                                    />
                                )}
                                {placeDetails.rating && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-500">⭐</span> {placeDetails.rating}
                                    </div>
                                )}
                                {placeDetails.formatted_address && (
                                    <div className="text-gray-600 truncate">{placeDetails.formatted_address}</div>
                                )}
                                {placeDetails.opening_hours && (
                                    <div className={placeDetails.opening_hours.isOpen() ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                        {placeDetails.opening_hours.isOpen() ? "Open Now" : "Closed"}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-[12px]">Loading details...</div>
                        )}

                        {!placeDetails && selectedMarker.place.description && (
                            <div className="text-gray-600 text-xs mt-1">{selectedMarker.place.description}</div>
                        )}
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
