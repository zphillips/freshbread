import React, { useEffect, useRef, useCallback, useState } from 'react';
import './App.css';
import Maps from './Maps.js';
import Rest from './Rest.js'

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api"

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete"

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox"
import "@reach/combobox/styles.css"

function App() {

  // get geolocation
  const [loc, setLoc] = useState([])
  const [userMarker, setUserMarker] = useState([])

  const libraries = ["places"]
  const [cent, SetCenter] = useState({'lat': 47.655548, 'lng': -122.303200 })

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  }
  const center = {
    lat: cent['lat'],
    lng: cent['lng']
  }
  const options = {
    // snazzy map?
    // 10:20
    // https://www.youtube.com/watch?v=WZcxJGmLbSo
    disableDefaultUI: true,
    zoomControl: true
  }

  // load google script
  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  if (isLoaded) {
    getLocation()
  }

  function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showCoords)
    } else {
      alert("Geolocation not supported on browser")
    }
  }

  function showCoords(position) {
      setLoc([position.coords.latitude, position.coords.longitude])
  }


  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, [])


  const panTo = useCallback(({ lat, lng}) => {
    mapRef.current.panTo({ lat, lng })
    mapRef.current.setZoom(14)
  }, [])


  // getting restaurants in 2000m vicinity 
  const proxy = "https://cors-anywhere.herokuapp.com/"
  const [rests, setRests] = useState([])
  // const [latlng, setLatLng] = useState()
  const latlng = []
  const placeIds = {}
  const [selected, setSelected] = useState(null)

  function restData(location, radius) {
      // fetch(proxy + "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + loc[0] + "," + loc[1] + "&radius=2000&type=restaurant&business_status=%22OPERATIONAL%22&key=AIzaSyCAPAHIXKeSmyHhvnqB12dLxBavJb4k_rA")
      fetch(proxy + "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + location['lat'] + "," + location['lng'] + "&" + "radius=" + radius + "&type=restaurant&business_status=%22OPERATIONAL%22&key=" + process.env.REACT_APP_GOOGLE_MAPS_API_KEY)  
        .then(res => res.json())
        .then(json => {
          // console.log(json.results)
          setRests(json.results)
          json.results.map((rest) => {
            const dict = {"restName": rest.name, "lat": rest.geometry.location.lat, "lng": rest.geometry.location.lng}
            // latlng.push(dict)
            latlng.push(dict)
            placeIds[rest.name] = rest.place_id
            // const dict = rest.geometry.location 
            // console.log(rest)
          })
          console.log(latlng)
        })
        .catch(err => {
          console.log("Error. Could not find location.")
          console.log(err)
        })
  }

  const [conf, setConf] = useState()
  function covidData(county, state) {
    fetch("https://covid19-us-api.herokuapp.com/county")
      .then(res => res.json())
      .then(json => {
        var data = json.message
        console.log(data);
        data.map((stateData) => {
          // console.log(stateData)
          if(stateData['county_name'] === county) {
            console.log(stateData['confirmed'])
            setConf(stateData['confirmed'])
          }
        })
      })
  }

  function Search() {
    const {
      ready,
      value,
      suggestions: { status, data },
      setValue,
      clearSuggestions,
    } = usePlacesAutocomplete({
      requestOptions: {
         location: {lat: () => 47.655548, lng: () => -122.303200},
         radius: 200 * 1000
      }
    })

    return (
      <div id="search">
        <Combobox
          onSelect={ async (address) => {
            console.log(address)
            setValue(address, false)
            clearSuggestions()
            try {
              const results = await getGeocode({address})
              console.log(address)

              var county = ""
              var state = ""

              results[0].address_components.map((res) => {
                // const match = /County/.exec(res)
                // if (match != null) { county = match }
                // console.log(/[a-z]+\sCounty/.exec(res))
                // console.log(res['long_name'].includes("County"))
                if (res['long_name'].includes("County")) {
                  county = res['long_name']
                }

                if(res['short_name'].length === 2 & res['short_name'] != "US") {
                  state = res['long_name']
                }
              })

              var words = county.split(' ')
              words.pop()
              county = words.join(' ')
              console.log(county)

              covidData(county, state)


              const { lat, lng } = await getLatLng(results[0])
              panTo({ lat, lng })
              SetCenter({ lat, lng})
              covidData()
              restData({ lat, lng }, 200000)
              // grab county here!
              // console.log(results[0])
              // console.log(results[0].address_components[4]["long_name"])
            } catch(err) {
              console.log(err)
            }
          }}
        >
          <ComboboxInput
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            disabled={!ready}
            placeholder="Enter an address"
          />
          <ComboboxPopover>
            <ComboboxList>
              {status === "OK" && data.map(({id, description}) => {
                return (
                  <ComboboxOption
                    key={id}
                    value={description}
                  />
                )
              })}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
      </div>
    )
  }

  function Locate({panTo}) {
    return (
      // add image
      <button
        id="locate"
        onClick={() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log(position)
              panTo({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              })
            },
            (error) => console.log(error), options)
        }}
      >
        User Location
      </button>
    )
  }

  
  if (loadError) return "Error Loading Maps"
  if (!isLoaded) return "Loading Maps"

  return (
    <div className="App">
      <header className="App-header">
        <h1 id='title'>Safe Eats</h1>
        <section id="safe-eats">
          <div id="maps-container">
            <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={center}
            options={options}
            onLoad={onMapLoad}
            >
              {/* //markers */}
              {latlng.map((coord) => {
                const position = {}
                position["lat"] = coord['lat']
                position['lng'] = coord['lng']

                console.log("Making marker")
                
                // return(
                // <Marker
                //   key={placeIds[coord["restName"]]}
                //   position={position}
                //   icon={{}}
                //   onClick={() => {
                //     setSelected(coord)
                //   }}
                // />
                // )
              })}
              {selected ? <InfoWindow>
                <div 
                  position={{lat: selected['lat'], lng: selected['lng']}}
                  onCloseClick={() => {
                    setSelected(null)
                  }}>
                  <h2>{selected["name"]}</h2>
                </div>
              </InfoWindow> : null}
            </GoogleMap>
          </div>
          <div id="rest-container">
            <div >
              <Search panTo={panTo} />
              {/* <Locate panTo={panTo} /> */}
            </div>
            <div id="results">
              {rests.map((rest) => {
                // console.log(rest.geometry.location)
                // console.log(rest.place_id)
                return(
                  <Rest
                    name={rest.name}
                    rating={rest.rating}
                    // price_level={rest.price_level}
                    confirmed={conf}
                  />
                ) 
              })}
            </div>
          </div>
        </section>
      </header>
    </div>
  );
}

export default App;
