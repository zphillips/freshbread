import React from 'react';
import { Map, Marker, GoogleApiWrapper } from 'google-maps-react';

const Maps = () => {

  const style = {
    width: '500px',
    height: '500px'
  }

  function onMarkerClick(props, marker, e) {
    this.setState({
      selectedPlace: props,
      activeMarker: marker
    });
  }

    return (
      <div>
          <p>Google Maps</p>
          <Map 
            google={window.google} 
            zoom={10}
            initialCenter={{
            lat: 35.5496939,
            lng: -120.7060049
            }}
            style={style}
          />
          <Marker onClick={onMarkerClick}
                name={'Current location'} />
      </div>
    );
}

export default GoogleApiWrapper({ apiKey: ('AIzaSyCAPAHIXKeSmyHhvnqB12dLxBavJb4k_rA') })(Maps);