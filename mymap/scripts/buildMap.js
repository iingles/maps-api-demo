const firestore = mapApp.firestore()

let val

const address = document.getElementById('address')
const coordsUpdate = document.getElementById('generatedCoords')

// Variable for geocoding
let geocoder

// Create the new map
let map

address.addEventListener('keydown', (evt) => {
    coordsUpdate.innerHTML = evt.target.value
})


function initMap() {
    let currWindow = false

    // Map options
    const options = {
        zoom: 10,
        center: {
            lat: 40.6097,
            lng: -111.9391
        }
    }   

    map = new google.maps.Map(document.getElementById("map"), options)
    geocoder = new google.maps.Geocoder()

    let latlng = new google.maps.LatLng(-34.397, 150.644)

     

    const brokers = []

    const brokerRef = firestore.collection('brokers-public')

    const data = brokerRef.get().then(data => {
        data.forEach(doc => {
            brokers.push({ ...doc.data() })
        })

        // Loop through markers
        for (let i = 0; i < brokers.length; i++) {
            addMarker(brokers[i])
        }
    })
    
    
    // Add Marker function
    function addMarker(props) {

        const marker = new google.maps.Marker({
            position: { lat: props.coords.ef, lng: props.coords.nf },
            map: map,
            //icon: props.icon
        })

        // Check for custom icon
        if (props.icon) {
            // set icon image
            marker.setIcon(props.icon)
        }

        // Check for custom content
        if (props.bio) {

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="broker-info-container">
                        <img class="broker-map-photo" src="${props.photo}"/>
                        <div class="broker-desc">
                            <h2 class="broker-title">${props.name}</h2>
                            <p>${props.bio}</p>
                        </div>
                    </div>
                    `
            })

            marker.addListener('click', () => {

                if (currWindow) {
                    currWindow.close()
                }

                // Center the window on the clicked position
                currWindow = infoWindow

                map.setCenter(infoWindow.getPosition())
                infoWindow.open(map, marker)

            })
        }

    }

    

    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input")
    const searchBox = new google.maps.places.SearchBox(input)
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds())
    })

    let markers = []
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach(marker => {
            marker.setMap(null)
        })

        markers = []

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds()
        places.forEach(place => {
            if (!place.geometry) {
                console.log("Returned place contains no geometry")
                return;
            }
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            }

            // Create a marker for each place.
            markers.push(
                new google.maps.Marker({
                    map,
                    icon,
                    title: place.name,
                    position: place.geometry.location
                })
            );

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        })
        map.fitBounds(bounds);
    })
}

// for geocoding
function codeAddress() {
    // const address = document.getElementById('address').nodeValue

    const addressValue = address.value
    
    geocoder.geocode({
        'address': addressValue
    },
        function (results, status) {
            if (status == 'OK') {
                map.setCenter(results[0].geometry.location)

                const marker = new google.maps.Marker({
                    map,
                    position: results[0].geometry.location
                })

                coordsUpdate.innerHTML = `generated coordinates: ${results[0].geometry.location}`

            } else {
                alert('Geocode was not successful for the following reason: ' + status)
            }
        }
    )
}