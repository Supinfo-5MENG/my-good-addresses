import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

interface WebMapProps {
    data: {
        region: {
            latitude: number;
            longitude: number;
        };
        userLocation: {
            latitude: number;
            longitude: number;
        } | null;
        addresses: Array<{
            id: string;
            name: string;
            description?: string;
            location: {
                latitude: number;
                longitude: number;
            };
            color: string;
        }>;
        selectedAddress: any;
    };
    onMarkerPress?: (address: any) => void;
    onMapPress?: (coordinate: { latitude: number; longitude: number }) => void;
}

const WebMap: React.FC<WebMapProps> = ({
                                           data,
                                           onMarkerPress,
                                           onMapPress,
                                       }) => {
    const iframeRef = useRef<any>(null);

    useEffect(() => {
        if (iframeRef.current) {
            console.log('Posting message to iframe with data:', data);
            iframeRef.current.contentWindow?.postMessage(
                {
                    type: 'updateMap',
                    data: {
                        center: [data.region.latitude, data.region.longitude],
                        zoom: 13,
                        markers: data.addresses.map(addr => ({
                            id: addr.id,
                            position: [addr.location.latitude, addr.location.longitude],
                            popup: `<b>${addr.name}</b><br>${addr.description || ''}`,
                            color: addr.color,
                        })),
                        userLocation: data.userLocation ? [
                            data.userLocation.latitude,
                            data.userLocation.longitude,
                        ] : null,
                    },
                },
                '*'
            );
        }
    }, [data]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'markerClick' && onMarkerPress) {
                const address = data.addresses.find(a => a.id === event.data.markerId);
                if (address) {
                    onMarkerPress(address);
                }
            } else if (event.data.type === 'mapClick' && onMapPress) {
                onMapPress({
                    latitude: event.data.lat,
                    longitude: event.data.lng,
                });
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [data.addresses, onMarkerPress, onMapPress]);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; }
                .custom-marker {
                    background-color: white;
                    border: 2px solid;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                let map = L.map('map').setView([48.8566, 2.3522], 13);
                let markers = [];
                let userMarker = null;

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);
                
                function createIcon(color) {
                    return L.divIcon({
                        html: '<div style="background-color: ' + color + '; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
                        className: 'custom-div-icon',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12]
                    });
                }

                window.addEventListener('message', function(event) {
                    if (event.data.type === 'updateMap') {
                        const { center, zoom, markers: newMarkers, userLocation } = event.data.data;
 
                        if (center) {
                            map.setView(center, zoom || 13);
                        }

                        markers.forEach(m => map.removeLayer(m));
                        markers = [];
                        
                        newMarkers.forEach(function(markerData) {
                            const marker = L.marker(markerData.position, {
                                icon: createIcon(markerData.color)
                            })
                            .bindPopup(markerData.popup)
                            .addTo(map);
                            
                            marker.on('click', function() {
                                window.parent.postMessage({
                                    type: 'markerClick',
                                    markerId: markerData.id
                                }, '*');
                            });
                            
                            markers.push(marker);
                        });

                        if (userLocation) {
                            if (userMarker) {
                                map.removeLayer(userMarker);
                            }
                            userMarker = L.circleMarker(userLocation, {
                                radius: 8,
                                fillColor: '#007AFF',
                                color: 'white',
                                weight: 2,
                                opacity: 1,
                                fillOpacity: 0.8
                            }).addTo(map);
                        }
                    }
                });
                
                map.on('click', function(e) {
                    window.parent.postMessage({
                        type: 'mapClick',
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                    }, '*');
                });
                
                window.parent.postMessage({ type: 'mapReady' }, '*');
            </script>
        </body>
        </html>
    `;

    return (
        <View style={{ height : '100%', width: '100%' }}>
            <iframe
                ref={iframeRef}
                srcDoc={htmlContent}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                }}
                title="Map"
            />
        </View>
    );
};

export default WebMap;