
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issues in Leaflet with React
// This is a common issue where the marker icons don't load correctly
// We need to manually set the icon paths or use a custom icon
// For now, we'll just try to use the default and see if it works, or we can use a simple custom icon if needed.
// Actually, let's just do a basic setup first.

// We need to ensure the container has a height.
// The parent container in page.tsx likely controls the height, but we should make sure the MapContainer takes 100% of it.

const Map = () => {
    // Default position (e.g., London or User's location if available)
    const position: [number, number] = [51.505, -0.09];

    return (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map;
