import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../constants';

interface MobileMapProps {
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
    showUserLocation?: boolean;
    height: number;
}

const MobileMap: React.FC<MobileMapProps> = ({
                                                 data,
                                                 onMarkerPress,
                                                 onMapPress,
                                                 showUserLocation,
                                                 height,
                                             }) => {
    const webViewRef = useRef<WebView>(null);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; }
                .leaflet-container {
                    background: #f5f5f5;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                let map;
                let markers = [];
                let userMarker = null;

                function initMap() {
                    map = L.map('map', {
                        zoomControl: true,
                        attributionControl: false
                    }).setView([${data.region.latitude}, ${data.region.longitude}], 13);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19
                    }).addTo(map);
                    
                    updateMarkers(${JSON.stringify(data.addresses)});

                    ${data.userLocation ? `
                        addUserLocation(${data.userLocation.latitude}, ${data.userLocation.longitude});
                    ` : ''}
                    
                    map.on('click', function(e) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'mapClick',
                            latitude: e.latlng.lat,
                            longitude: e.latlng.lng
                        }));
                    });
                }

                function createIcon(color) {
                    return L.divIcon({
                        html: '<div style="background-color: ' + color + '; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        className: 'custom-div-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });
                }
                
                function updateMarkers(newMarkers) {
                    markers.forEach(m => map.removeLayer(m));
                    markers = [];

                    newMarkers.forEach(function(markerData) {
                        const marker = L.marker(
                            [markerData.location.latitude, markerData.location.longitude],
                            { icon: createIcon(markerData.color) }
                        )
                        .bindPopup('<b>' + markerData.name + '</b><br>' + (markerData.description || ''))
                        .addTo(map);
                        
                        marker.on('click', function() {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'markerClick',
                                addressId: markerData.id
                            }));
                        });
                        
                        markers.push(marker);
                    });
                }

                function addUserLocation(lat, lng) {
                    if (userMarker) {
                        map.removeLayer(userMarker);
                    }
                    userMarker = L.circleMarker([lat, lng], {
                        radius: 10,
                        fillColor: '#007AFF',
                        color: 'white',
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);
                }

                window.addEventListener('message', function(event) {
                    const data = JSON.parse(event.data);
                    if (data.type === 'updateMap') {
                        if (data.center) {
                            map.setView(data.center, data.zoom || 13);
                        }
                        if (data.markers) {
                            updateMarkers(data.markers);
                        }
                        if (data.userLocation) {
                            addUserLocation(data.userLocation[0], data.userLocation[1]);
                        }
                    }
                });

                document.addEventListener('DOMContentLoaded', initMap);
            </script>
        </body>
        </html>
    `;

    const handleMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message.type === 'markerClick' && onMarkerPress) {
                const address = data.addresses.find(a => a.id === message.addressId);
                if (address) {
                    onMarkerPress(address);
                }
            } else if (message.type === 'mapClick' && onMapPress) {
                onMapPress({
                    latitude: message.latitude,
                    longitude: message.longitude,
                });
            }
        } catch (error) {
            console.error('Error handling WebView message:', error);
        }
    };

    useEffect(() => {
        if (webViewRef.current) {
            const updateData = {
                type: 'updateMap',
                center: [data.region.latitude, data.region.longitude],
                zoom: 13,
                markers: data.addresses,
                userLocation: data.userLocation ? [
                    data.userLocation.latitude,
                    data.userLocation.longitude,
                ] : null,
            };

            webViewRef.current.postMessage(JSON.stringify(updateData));
        }
    }, [data]);

    return (
        <View style={[styles.container, { height }]}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                style={styles.webView}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={false}
                scrollEnabled={false}
                bounces={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    webView: {
        flex: 1,
    },
});

export default MobileMap;