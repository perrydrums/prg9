import React from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';
import { Constants, MapView, Location, Permissions } from 'expo';

export default class App extends React.Component {

  state = {
    mapRegion: null,
    permissions: false,
    locationResult: null,
    location: {coords: { latitude: null, longitude: null}},
  };

  componentDidMount() {
    this.permissionFlow();
  }

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  permissionFlow = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      Linking.openURL('app-settings:');
      return;
    }
    else {
      this.setState({permissions: true});
    }

    const location = await Location.getCurrentPositionAsync({});
    this.setState({ locationResult: JSON.stringify(location), location, });

    this.setState({mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }});
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
                  <MapView.Marker
                    coordinate={this.state.location.coords}
                    title="My Marker"
                    description="Some description"
                  />
                </MapView>

        }
      </View>
    );
  }
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
