import React from 'react';
import { StyleSheet, Text, View, Linking, Button, AsyncStorage } from 'react-native';
import { Constants, MapView, Location, Permissions, TaskManager } from 'expo';

export default class App extends React.Component {

  state = {
    mapRegion: null,
    permissions: false,
    locationResult: null,
    location: {coords: { latitude: null, longitude: null}},
    fences: [],
  };

  componentDidMount() {
    this.permissionFlow();
    this._getGeofences();
    Location.startGeofencingAsync('task-geofencing', this.state.fences)
  }

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  _saveGeofences = async () => {
    try {
      await AsyncStorage.setItem('geofences', JSON.stringify(this.state.fences));
    } catch (error) {
      // Error saving data
    }
  };

  _getGeofences = async () => {
    try {
      const value = await AsyncStorage.getItem('geofences');
      if (value !== null) {
        this.state.fences = JSON.parse(value);
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  _addGeoFence = async () => {
    // Get current location.
    const location = await Location.getCurrentPositionAsync({});

    // Save location.
    this.state.fences.push(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 100,
      }
    );

    this._saveGeofences();
  };

  permissionFlow = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      Linking.openURL('app-settings:');
      return;
    }
    else {
      this.setState({ permissions: true });
    }

    const location = await Location.getCurrentPositionAsync({});
    this.setState({ locationResult: JSON.stringify(location), location, });

    this.setState({
      mapRegion: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.locationResult === null ?
            <Text>Finding your current location...</Text> :
            this.state.permissions === false ?
              <Text>Location permissions are not granted.</Text> :
              this.state.mapRegion === null ?
                <Text>Map region doesn't exist.</Text> :
                <MapView
                  style={{ alignSelf: 'stretch', height: 400 }}
                  region={this.state.mapRegion}
                  onRegionChange={this._handleMapRegionChange}
                >
                  {this.state.fences.map((fence, i) => {
                    return (
                      <MapView.Marker
                        coordinate={{latitude: fence.latitude, longitude: fence.longitude}}
                        title="Geofence"
                      />
                    )
                  })}
                </MapView>
        }
        <Button
          title="Add Geo Fence"
          onPress={this._addGeoFence}
        />
      </View>
    );
  }
}

if (!TaskManager.isTaskRegisteredAsync('task-geofencing')) {
  TaskManager.defineTask('task-geofencing', ({data, error}) => {

  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});
