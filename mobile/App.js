import React from 'react';
import { StyleSheet, Text, View, Linking, Button, AsyncStorage, Alert, AppState } from 'react-native';
import { Constants, MapView, Location, Permissions, TaskManager, Notifications } from 'expo';

export default class App extends React.Component {

  state = {
    mapRegion: null,
    permissions: false,
    notifications: false,
    locationResult: null,
    location: {coords: { latitude: null, longitude: null}},
    fences: [],
  };

  async componentDidMount() {
    // AsyncStorage.clear();
    this.permissionFlowLocation();

    if (await this._getGeofences()) {
      console.log('startGeofencingAsync!');
      Location.startGeofencingAsync('task-geofencing', this.state.fences);
    }
  }

  componentWillMount() {
    this.permissionFlowNotifications();
    this.listener = Notifications.addListener(this.listen);
  }
  componentWillUnmount() {
    this.listener = Notifications.removeListener(this.listen);
  }

  listen = ({origin, data}) => {
    console.log('data', origin, data);
  };

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  _saveGeofences = async () => {
    try {
      await AsyncStorage.setItem('geofences', JSON.stringify(this.state.fences));
      this._getGeofences();
    } catch (error) {
      // Error saving data
    }
  };

  _getGeofences = async () => {
    try {
      const value = await AsyncStorage.getItem('geofences');
      if (value !== null) {
        this.state.fences = JSON.parse(value);
        console.log('Geofences Gotten!');
        return true;
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  _addGeoFence = async () => {
    // Get current location.
    const location = await Location.getCurrentPositionAsync({});

    // Save location.
    const newFences = this.state.fences.concat(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 200,
      }
    );

    this.setState({
      fences: newFences
    });

    this._saveGeofences();
  };

  permissionFlowLocation = async () => {
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
        latitudeDelta: 0.008,
        longitudeDelta: 0.004,
      }
    });
  };

  permissionFlowNotifications = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);

    if (status !== 'granted') {
      Linking.openURL('app-settings:');
      return;
    }

    this.setState({ notifications: true });
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('token', token)
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
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                >
                  {this.state.fences.map((fence, i) => {
                    return (
                      <MapView.Marker
                        key={i}
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

TaskManager.defineTask('task-geofencing', ({data: {eventType, region}, error}) => {
  if (error) {
    console.log('error defineTASK', error);
    return;
  }
  console.log('TASK DEFINED!');
  if (eventType === Location.GeofencingEventType.Enter) {

    if (AppState.currentState === 'active') {
      Alert.alert('Hello!', 'You entered the area!');
    }
    else {
      Notifications.presentLocalNotificationAsync({
        title: 'Hello!',
        body: 'You entered the area!',
      });
    }

    console.log("You've entered region:", region);
  }
  else if (eventType === Location.GeofencingEventType.Exit) {

    if (AppState.currentState === 'active') {
      Alert.alert('Byebye!', 'You left the area!');
    }
    else {
      Notifications.presentLocalNotificationAsync({
        title: 'Byebye!',
        body: 'You left the area!',
      });
    }

    console.log("You've left region:", region);
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});
