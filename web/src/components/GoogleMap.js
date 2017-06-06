import axios from 'axios';
import canUseDOM from 'can-use-dom';
import LocationInput from './LocationInput';
import Promise from 'bluebird';
import React, { Component } from 'react';
import { Circle, GoogleMap, Marker, withGoogleMap } from 'react-google-maps';

const geolocation = (
  canUseDOM && navigator.geolocation ?
  navigator.geolocation :
  ({
    getCurrentPosition(success, failure) {
      if (failure) {
        console.log('Your browser does not support geolocation.');
      }
    },
  })
);

class Gmap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      center: {
        lat: 40.758895,
        lng: -73.985131,
      }
    };
    this.handleMapLoad = this.handleMapLoad.bind(this);
    // this.handleMapClick = this.handleMapClick.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
    // this.handleMarkerRightClick = this.handleMarkerRightClick.bind(this);
    this.handleReverseGeoCode = this.handleReverseGeoCode.bind(this);
  }

  componentDidMount() {
    let context = this;
    geolocation.getCurrentPosition((position) => {
      return new Promise((resolve, reject) => {
        resolve(this.setState({
          center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
        }));
      })
      .then(() => {
        context.props.addGeolocation([{
          position: {lat: this.state.center.lat, lng: this.state.center.lng},
          defaultAnimation: 3,
        }]);
        context.props.changeCenter(this.state.center);
      })
      .catch((err) => {
        console.log(err);
      });
    });
  }

  handleMapLoad(map) {
    this._mapComponent = map;
  }

  // handleMapClick(event) {
  //   const lat = event.latLng.lat();
  //   const lng = event.latLng.lng();
  //   const nextMarkers = [
  //     ...this.props.markers,
  //     {
  //       position: {lat: lat, lng: lng},
  //       defaultAnimation: 3,
  //     },
  //   ];
  //   this.props.setMarkers(nextMarkers);
  //   // this.props._mapComponent(lat, lng);
  //   this.props.changeCenter({lat: lat, lng: lng});
  //   this.handleReverseGeoCode({lat: lat, lng: lng});
  //   console.log(this.props.markers);
  // }

  handleMarkerClick(targetMarker, index) {
    this.props.setCurrentEvent(index);
    this.props.toggleEventDetails();
    this.props.changeCenter({
      lat: Number(targetMarker.lat),
      lng: Number(targetMarker.lng)
    });
  }

  // handleMarkerRightClick(targetMarker) {
  //   const nextMarkers = this.props.markers.filter(marker => marker !== targetMarker);
  //   this.props.setMarkers(nextMarkers);
  // }

  handleReverseGeoCode(latlng) {
    axios.post('/api/reverseGeoCode', {lat: latlng.lat, lng: latlng.lng})
    .then((res) => {
      console.log(res.data);
    })
    .catch((err) => {
      console.log(err);
    });
  }

  render () {

    const Map = withGoogleMap(props => (
      <GoogleMap
        ref={props.onMapLoad}
        zoom={14}
        center={this.props.center}
        // onClick={props.onMapClick}
        >
        {this.props.events.map((marker, index) => (
          <Marker
          // {...marker}
          defaultAnimation={3}
          event_name={marker.event_name}
          position={{lat: Number(marker.lat), lng: Number(marker.lng)}}
          onClick={() => props.onMarkerClick(marker, index)}
          // onRightClick={() => props.onMarkerRightClick(marker)}
          icon={'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'}
          key={'marker_' + index}
          >
          </Marker>
        ))}
        {props.geolocation.map((marker, index) => (
          <Marker
            // {...marker}
            defaultAnimation={3}
            position={{lat: this.state.center.lat, lng: this.state.center.lng}}
            key={'geo_' + index}
            icon={'http://maps.google.com/mapfiles/ms/icons/green-dot.png'}
          >
          </Marker>
        ))}
      </GoogleMap>
    ));

    return (
      <div style={styles.container}>
        <LocationInput
          markers={this.props.markers}
          setMarkers={this.props.setMarkers}
          changeCenter={this.props.changeCenter}
          handleReverseGeoCode={this.handleReverseGeoCode}

          />
        <Map style={styles.container}
          containerElement={ <div className='map-container' style={styles.container}></div>}
          mapElement={ <div id='map' className='map-section' style={styles.mapSize}></div>}
          onMapLoad={this.handleMapLoad}
          // onMapClick={this.handleMapClick}
          markers={this.props.markers}
          onMarkerRightClick={this.handleMarkerRightClick}
          onMarkerClick={this.handleMarkerClick}
          geolocation={this.props.geolocation}
        />
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    height: '100%'
  },
  mapSize: {
    position: 'absolute',
    height: 'calc(100% - 112px)',
    width: '50%',
  }
};


export default Gmap;
