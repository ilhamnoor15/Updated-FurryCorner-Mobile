// @ts-nocheck  (legacy script below is plain JavaScript carried over from my-addresses.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './my-addresses.markup';
import { supabase } from '../../../services/supabase.service';
import { SAVE_ADDRESS_COORDINATES } from '../../config';
import {
    NCR_CODE, loadPsgcIndex, loadPsgcRegion, loadPsgcBarangays, regionValue, independentProvinceValue, independentProvinceLabel,
    normalizeName, findRegion, locateCity
} from '../../legacy/psgc';

@Component({
  selector: 'app-my-addresses',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class MyAddressesPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  // Original <script> code of my-addresses.html. `location` is a shim that routes through the Angular Router.
  protected run(location: any, __onReady: any): void {

const addressForm = document.getElementById('addressForm');
const addressList = document.getElementById('addressList');
const addressStatus = document.getElementById('addressStatus');
const addressIdField = document.getElementById('addressId');
const saveAddressButton = document.getElementById('saveAddress');
const cancelEditButton = document.getElementById('cancelEdit');
let savedAddresses = [];


const regionField = document.getElementById('region');
const provinceField = document.getElementById('province');
const cityField = document.getElementById('city');
const barangayField = document.getElementById('barangay');

/* =====================================================
   PHILIPPINE ADDRESS DROPDOWNS
   Region -> Province -> City/Municipality -> Barangay, from the official PSA PSGC data bundled in
   assets/psgc (no internet, API key or billing needed). Logic lives in legacy/psgc.ts.
================================================= */
let psgcRegions = [];
let currentRegion = null;
let currentRegionData = null;
let locationRun = 0; // ignores slower, out-of-date loads when the user changes a dropdown quickly

function fillDropdown(select, items, placeholder, selectedValue = '', keepOrder = false) {
    select.replaceChildren();

    const firstOption = document.createElement('option');
    firstOption.value = '';
    firstOption.textContent = placeholder;
    select.append(firstOption);

    const list = keepOrder
        ? items
        : [...items].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }));

    list.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value ?? item.name;
        option.textContent = item.name;
        option.dataset.code = item.code ?? '';
        select.append(option);
    });

    select.value = selectedValue;
    if (select.value !== selectedValue) select.value = '';
}

// Keeps an older saved value selectable even if it is not in the current PSA list.
function ensureOption(select, value) {
    if (!value) return;
    if (![...select.options].some(option => option.value === value)) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        option.dataset.code = '';
        select.append(option);
    }
    select.value = value;
}

function resetBelow(level) {
    if (level <= 1) {
        fillDropdown(provinceField, [], 'Select province');
        provinceField.disabled = true;
    }
    if (level <= 2) {
        fillDropdown(cityField, [], 'Select city / municipality');
        cityField.disabled = true;
    }
    fillDropdown(barangayField, [], 'Select barangay');
    barangayField.disabled = true;
}

async function showRegion(region) {
    const run = ++locationRun;
    resetBelow(1);

    const data = await loadPsgcRegion(region);
    if (run !== locationRun) return false;

    currentRegion = region;
    currentRegionData = data;

    const isNCR = region.c === NCR_CODE;

    
if (isNCR) {
    fillDropdown(
        provinceField,
        [{
            name: 'Metro Manila',
            value: 'Metro Manila',
            code: ''
        }],
        'Select province',
        'Metro Manila',
        true
    );

    provinceField.disabled = false;

    fillCities();
    return true;
}

    const items = data.provinces
        .map(province => ({
            name: province.n,
            value: province.n,
            code: province.c
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    if (data.cities.some(city => !city.p)) {
        items.push({
            name: independentProvinceLabel(region),
            value: independentProvinceValue(region),
            code: ''
        });
    }

    fillDropdown(
        provinceField,
        items,
        'Select province',
        '',
        true
    );

    provinceField.disabled = false;

    if (items.length === 1) {
        provinceField.value = items[0].value;
        fillCities();
    }

    return true;
}

function fillCities(selectedCity = '') {
    resetBelow(2);

    if (!currentRegionData || !currentRegion) {
        return;
    }

    const isNCR = currentRegion.c === NCR_CODE;
    const option = provinceField.selectedOptions[0];

    // NCR has no province, so its cities can load directly.
    if (!isNCR && (!option || !option.value)) {
        cityField.disabled = true;
        barangayField.disabled = true;
        return;
    }

    const provinceCode = option?.dataset.code || '';

    const items = currentRegionData.cities
        .filter(city => isNCR || city.p === provinceCode)
        .map(city => ({
            name: city.n,
            code: city.c
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    fillDropdown(
        cityField,
        items,
        'Select city / municipality',
        selectedCity
    );

    cityField.disabled = items.length === 0;
    barangayField.disabled = true;
}


async function fillBarangays(selectedBarangay = '') {
    const option = cityField.selectedOptions[0];
    const code = option?.dataset.code || '';

    fillDropdown(barangayField, [], 'Loading barangays...');
    barangayField.disabled = true;

    if (!code || !currentRegionData) {
        fillDropdown(barangayField, [], 'Select barangay');
        return;
    }

    try {
        let names = currentRegionData.barangays?.[code] || [];

        if (!names.length) {
            names = await loadPsgcBarangays(code);
        }

        // Ignore a response if the user has selected another city.
        if (cityField.selectedOptions[0]?.dataset.code !== code) {
            return;
        }

        const match = names.find(
            name => normalizeName(name) === normalizeName(selectedBarangay)
        );

        fillDropdown(
            barangayField,
            names.map(name => ({ name })),
            'Select barangay',
            match || ''
        );

        barangayField.disabled = names.length === 0;

        if (!names.length) {
            fillDropdown(barangayField, [], 'No barangays available');
        }
    } catch (error) {
        console.error('Unable to load barangays:', error);
        fillDropdown(barangayField, [], 'Unable to load barangays');
        barangayField.disabled = true;

        if (addressStatus) {
            addressStatus.textContent =
                'Unable to load barangays. Check your internet connection and try again.';
            addressStatus.style.color = '#b42318';
        }
    }
}


// Sets all four dropdowns from saved text values (editing an address, resetting the form, or a map result).
async function applyLocation(location) {
    try {
        await regionsReady;
        const region = findRegion(psgcRegions, location.region) || findRegion(psgcRegions, 'NCR');
        if (!region) return;

        regionField.value = regionValue(region);
        if (!(await showRegion(region))) return;

        let hit = null;
        if (location.city) {
            const found = await locateCity(psgcRegions, region, [location.city], [location.province]);
            if (found && found.region === region) hit = found;
        }

        if (hit) {
            const option = [...provinceField.options].find(o => o.value && (o.dataset.code || '') === hit.city.p);
            if (option) provinceField.value = option.value;
            fillCities(hit.city.n);
            fillBarangays(location.barangay || '');
            if (location.barangay && !barangayField.value) ensureOption(barangayField, location.barangay);
            return;
        }

        // The saved city is not in the current PSA list: keep the saved text so the user can still edit it.
        if (location.city) {
            const option = [...provinceField.options].find(o => o.value && o.value === location.province);
            if (option) provinceField.value = option.value;
            resetBelow(2);
            ensureOption(cityField, location.city);
            cityField.disabled = false;
            if (location.barangay) {
                ensureOption(barangayField, location.barangay);
                barangayField.disabled = false;
            }
        }
    } catch (error) {
        setAddressStatus(error.message || 'Unable to load Philippine address data.', true);
    }
}

regionField.addEventListener('change', async () => {
    const region = findRegion(psgcRegions, regionField.value);
    if (!region) { resetBelow(1); return; }
    try {
        await showRegion(region);
    } catch (error) {
        setAddressStatus(error.message, true);
    }
});
provinceField.addEventListener('change', () => fillCities());
cityField.addEventListener('change', () => fillBarangays());

const regionsReady = (async () => {
    try {
        const index = await loadPsgcIndex();
        psgcRegions = Array.isArray(index.regions) ? index.regions : [];

        const items = [...psgcRegions]
            .sort((a, b) => (a.c === NCR_CODE ? -1 : b.c === NCR_CODE ? 1 : a.c.localeCompare(b.c)))
            .map(region => ({ name: region.n, value: regionValue(region), code: region.c }));

        fillDropdown(regionField, items, 'Select region', 'NCR', true);
        const ncr = findRegion(psgcRegions, 'NCR');
        if (!ncr) throw new Error('The Philippine address service did not return NCR. Please try again.');
        await showRegion(ncr);
    } catch (error) {
        setAddressStatus(error.message || 'Unable to load Philippine address data.', true);
    }
})();

/* =====================================================
   OPENSTREETMAP ADDRESS PICKER (Leaflet + Nominatim)
   No Google Maps key or Google Cloud billing is required.
================================================= */
const mapSearch = document.getElementById('mapSearch');
const mapSuggestions = document.getElementById('mapSuggestions');
const mapCanvas = document.getElementById('mapCanvas');
const mapStatus = document.getElementById('mapStatus');
const mapCoords = document.getElementById('mapCoords');
const useMyLocationButton = document.getElementById('useMyLocation');

const MANILA = { lat: 14.5995, lng: 120.9842 };
const PH_BOUNDS = { minLat: 4.5, maxLat: 21.5, minLng: 116, maxLng: 127 };
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const PHOTON_API = 'https://photon.komoot.io/api/';

let leaflet = null;
let map = null;
let marker = null;
let selectedCoords = null;
let geocodeRun = 0;
let searchRun = 0;
let searchTimer = null;

function setMapStatus(message, isError = false) {
    mapStatus.textContent = message;
    mapStatus.classList.toggle('error', isError);
}

function isValidCoords(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng) &&
        lat >= PH_BOUNDS.minLat && lat <= PH_BOUNDS.maxLat &&
        lng >= PH_BOUNDS.minLng && lng <= PH_BOUNDS.maxLng;
}

function updateCoordsText() {
    mapCoords.textContent = selectedCoords
        ? `Selected location: ${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
        : 'No map location selected.';
}

function describeMapError(error) {
    if (!navigator.onLine) return 'No internet connection. Reconnect, or type your address manually.';
    return 'OpenStreetMap address lookup is temporarily unavailable. You can still choose a point on the map or type your address manually.';
}

function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (window.__furryLeafletPromise) return window.__furryLeafletPromise;
    window.__furryLeafletPromise = new Promise((resolve, reject) => {
        if (!document.querySelector('link[data-furry-leaflet]')) {
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            css.dataset.furryLeaflet = 'true';
            document.head.appendChild(css);
        }
        let script = document.querySelector('script[data-furry-leaflet]');
        const finish = () => {
            if (window.L) resolve(window.L);
            else reject(new Error('Leaflet library did not load'));
        };
        if (script) {
            script.addEventListener('load', finish, { once: true });
            script.addEventListener('error', () => reject(new Error('Leaflet could not load')), { once: true });
            if (window.L) finish();
            return;
        }
        script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.dataset.furryLeaflet = 'true';
        script.onload = finish;
        script.onerror = () => reject(new Error('Leaflet could not load'));
        document.head.appendChild(script);
    });
    return window.__furryLeafletPromise;
}

function hideSuggestions() {
    mapSuggestions.hidden = true;
    mapSuggestions.replaceChildren();
}

function showSuggestionMessage(message) {
    mapSuggestions.replaceChildren();
    const note = document.createElement('div');
    note.className = 'map-suggestions-empty';
    note.textContent = message;
    mapSuggestions.append(note);
    mapSuggestions.hidden = false;
}

function setLocation(lat, lng, options = {}) {
    lat = Number(lat);
    lng = Number(lng);
    if (!isValidCoords(lat, lng)) {
        setMapStatus('Please select a location within the Philippines.', true);
        return;
    }
    selectedCoords = { lat, lng };
    updateCoordsText();
    if (map && leaflet) {
        if (!marker) {
            marker = leaflet.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on('dragend', () => {
                const pos = marker.getLatLng();
                setLocation(pos.lat, pos.lng, { reverse: true });
            });
        } else marker.setLatLng([lat, lng]);
        map.panTo([lat, lng]);
        if (options.zoom) map.setZoom(options.zoom);
    }
    if (options.reverse) reverseGeocode(lat, lng);
}

function findOptionValue(select, candidates) {
    const options = [...select.options].filter(option => option.value);
    for (const candidate of candidates) {
        const wanted = normalizeName(candidate);
        if (!wanted) continue;
        const match = options.find(option => normalizeName(option.value) === wanted);
        if (match) return match.value;
    }
    return '';
}

function osmCityCandidates(addr) {
    return [addr.city, addr.town, addr.municipality, addr.village, addr.city_district, addr.county].filter(Boolean);
}

async function applyOsmAddress(result) {
    const addr = result.address || {};
    const house = addr.house_number || '';
    const road = addr.road || addr.pedestrian || addr.footway || addr.residential || '';
    const street = `${house} ${road}`.trim();
    if (street) document.getElementById('addressLine').value = street.slice(0, 255);
    if (addr.postcode) document.getElementById('postalCode').value = String(addr.postcode).slice(0, 20);

    await regionsReady;
    const cityCandidates = osmCityCandidates(addr);
    const provinceHints = [addr.state, addr.province, addr.county].filter(Boolean);
    let found = null;
    try {
        found = await locateCity(psgcRegions, currentRegion || undefined, cityCandidates, provinceHints);
    } catch (error) {
        setMapStatus(error.message || 'Unable to match this location to the Philippine address list.', true);
        return;
    }

    let barangayMatched = false;
    if (found) {
        await applyLocation({
            region: regionValue(found.region),
            province: found.provinceName,
            city: found.city.n,
            barangay: ''
        });
        const barangayCandidates = [addr.suburb, addr.neighbourhood, addr.quarter, addr.city_district, addr.village].filter(Boolean);
        const barangayValue = findOptionValue(barangayField, barangayCandidates);
        if (barangayValue) {
            barangayField.value = barangayValue;
            barangayMatched = true;
        }
    }

    if (!found) {
        setMapStatus('Location selected. Please choose the region, province, city and barangay manually, then review the street address.', true);
    } else if (!barangayMatched) {
        setMapStatus('Address partly filled. Please choose your barangay and check the postal code.');
    } else {
        setMapStatus('Address filled from OpenStreetMap. Please review it before saving.');
    }
}

async function reverseGeocode(lat, lng) {
    const run = ++geocodeRun;
    setMapStatus('Finding the address...');
    try {
        const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1&zoom=18&accept-language=en`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Reverse lookup failed (${response.status})`);
        const result = await response.json();
        if (run !== geocodeRun) return;
        if (!result || !result.address) {
            setMapStatus('No address was found for this point. You can type it in manually.', true);
            return;
        }
        if (result.display_name) mapSearch.value = result.display_name;
        await applyOsmAddress(result);
    } catch (error) {
        if (run !== geocodeRun) return;
        console.error('OpenStreetMap reverse lookup failed:', error);
        setMapStatus(describeMapError(error), true);
    }
}


async function runSearch(query) {
    const run = ++searchRun;

    try {
        const params = new URLSearchParams({
            q: `${query} Philippines`,
            limit: '5',
            lang: 'en',
            countrycode: 'PH',
            bbox: '116,4.5,127,21.5'
        });

        const response = await fetch(`${PHOTON_API}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Address search failed (${response.status})`);
        }

        const data = await response.json();

        if (run !== searchRun) return;

        const results = (data.features || []).filter(feature => {
            const props = feature.properties || {};
            const coords = feature.geometry?.coordinates;

            return (
                props.countrycode?.toUpperCase() === 'PH' &&
                Array.isArray(coords) &&
                isValidCoords(Number(coords[1]), Number(coords[0]))
            );
        });

        if (!results.length) {
            showSuggestionMessage(
                'No matching Philippine locations found. Try a different search.'
            );
            return;
        }

        mapSuggestions.replaceChildren();

        results.forEach(feature => {
            const props = feature.properties || {};
            const coordinates = feature.geometry.coordinates;
            const lng = Number(coordinates[0]);
            const lat = Number(coordinates[1]);

            const parts = [
                props.name,
                props.street,
                props.district,
                props.city,
                props.state,
                props.postcode,
                props.country
            ].filter(Boolean);

            const displayName = [...new Set(parts)].join(', ');

            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('role', 'option');
            button.textContent = displayName || query;

            button.addEventListener('click', async () => {
                hideSuggestions();

                mapSearch.value = displayName || query;

                setLocation(lat, lng, {
                    zoom: 17,
                    reverse: false
                });

                // Convert Photon properties to the address format
                // already understood by the existing form logic.
                const result = {
                    lat,
                    lon: lng,
                    display_name: displayName,
                    address: {
                        house_number: props.housenumber || '',
                        road: props.street || '',
                        suburb: props.district || props.locality || '',
                        neighbourhood: props.locality || '',
                        city: props.city || '',
                        town: props.city || '',
                        municipality: props.city || '',
                        village: props.city || '',
                        county: props.county || '',
                        state: props.state || '',
                        province: props.state || '',
                        postcode: props.postcode || '',
                        country: props.country || 'Philippines'
                    }
                };

                await applyOsmAddress(result);

                setMapStatus(
                    'Location selected. Review the address and confirm the barangay before saving.'
                );
            });

            mapSuggestions.append(button);
        });

        mapSuggestions.hidden = false;

    } catch (error) {
        if (run !== searchRun) return;

        console.error('Photon address search failed:', error);

        showSuggestionMessage(
            'Address suggestions are temporarily unavailable. You can still enter your address manually.'
        );

        setMapStatus(
            'Address search is temporarily unavailable. Please try again later.',
            true
        );
    }
}


function clearMapSelection() {
    geocodeRun++;
    searchRun++;
    selectedCoords = null;
    if (marker && map) { map.removeLayer(marker); marker = null; }
    mapSearch.value = '';
    hideSuggestions();
    updateCoordsText();
    if (map) setMapStatus('Search for a place, tap the map, or drag the pin.');
}

function showSavedLocation(address) {
    clearMapSelection();
    const lat = Number(address.latitude);
    const lng = Number(address.longitude);
    if (address.latitude == null || address.longitude == null || !isValidCoords(lat, lng)) return;
    setLocation(lat, lng, { zoom: 16, reverse: false });
}

mapSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const query = mapSearch.value.trim();
    if (query.length < 3) {
        searchRun++;
        hideSuggestions();
        return;
    }
    searchTimer = setTimeout(() => runSearch(query), 700);
});

mapSearch.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        const first = mapSuggestions.querySelector('button');
        if (first) first.click();
    } else if (event.key === 'Escape') hideSuggestions();
});

document.addEventListener('click', event => {
    if (!event.target.closest('.map-search-wrap')) hideSuggestions();
});

useMyLocationButton.addEventListener('click', () => {
    if (!map || !navigator.geolocation) {
        setMapStatus('Current location is not available. Search for a place or tap the map instead.', true);
        return;
    }
    setMapStatus('Getting your location...');
    navigator.geolocation.getCurrentPosition(
        position => setLocation(position.coords.latitude, position.coords.longitude, { zoom: 17, reverse: true }),
        error => {
            if (error.code === 1) setMapStatus('Location permission was denied. Search for a place or tap the map instead.', true);
            else if (error.code === 3) setMapStatus('Finding your location took too long. Please try again.', true);
            else setMapStatus('Your location is unavailable right now. Search for a place instead.', true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
});

async function initMap() {
    mapSearch.disabled = false;

    try {
        leaflet = await loadLeaflet();
        mapCanvas.hidden = false;
        map = leaflet.map(mapCanvas, { zoomControl: true }).setView(
            selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : [MANILA.lat, MANILA.lng],
            selectedCoords ? 16 : 12
        );
        leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        map.on('click', event => setLocation(event.latlng.lat, event.latlng.lng, { reverse: true }));
        if (selectedCoords) setLocation(selectedCoords.lat, selectedCoords.lng, { zoom: 16, reverse: false });
        mapSearch.disabled = false;
        useMyLocationButton.disabled = false;
        setMapStatus('Search for a place, tap the map, or drag the pin to set your location.');
        setTimeout(() => map.invalidateSize(), 150);
    } catch (error) {
    console.error('OpenStreetMap failed to load:', error);
    mapSearch.disabled = false;
    mapCanvas.hidden = false;
    setMapStatus(
        'The map could not load. Address search and manual entry may still be available.',
        true
    );
}
}

updateCoordsText();
initMap();


function setAddressStatus(message, isError = false){
    addressStatus.textContent = message;
    addressStatus.classList.toggle('error', isError);
}


function getCurrentUserId() {
    return localStorage.getItem('loggedInUserId');
}

async function loadAddresses() {
    try {
        const userId = getCurrentUserId();

        if (!userId) {
            throw new Error('Please sign in to view your addresses.');
        }

        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        savedAddresses = (data || []).map(address => {
            const nameParts = (address.recipient_name || '').trim().split(/\s+/);
            const firstName = nameParts.shift() || '';

            return {
                ...address,
                address_id: address.id,
                address_label: address.label || 'My address',
                first_name: firstName,
                last_name: nameParts.join(' ')
            };
        });

        renderAddresses();
    } catch (error) {
        setAddressStatus(error.message || 'Unable to load addresses.', true);
    }
}


function addressText(address){
    return [
        address.address_line,
        `${address.barangay ? address.barangay + ', ' : ''}${address.city || ''}, ${address.region || 'NCR'} ${address.postal_code || ''}`.trim(),
        address.phone
    ].filter(Boolean).join('\n');
}


function renderAddresses(){
    addressList.replaceChildren();
    if(savedAddresses.length === 0){
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No saved addresses yet. Add one to use it at checkout or when booking a service.';
        addressList.append(empty);
        return;
    }

    savedAddresses.forEach(address => {
        const card = document.createElement('article');
        card.className = 'address-card';
        const head = document.createElement('div');
        head.className = 'address-card-head';
        const title = document.createElement('h3');
        title.textContent = address.address_label;
        head.append(title);
        if(Number(address.is_default)){
            const badge = document.createElement('span');
            badge.className = 'default-badge';
            badge.textContent = 'Default';
            head.append(badge);
        }
        const recipient = document.createElement('p');
        recipient.textContent = `${address.first_name} ${address.last_name}`.trim();
        const details = document.createElement('p');
        details.textContent = addressText(address);
        details.style.whiteSpace = 'pre-line';
        const actions = document.createElement('div');
        actions.className = 'address-actions';
        if(!Number(address.is_default)) actions.append(createAddressAction('Make default', 'default', address.address_id));
        actions.append(createAddressAction('Edit', 'edit', address.address_id));
        actions.append(createAddressAction('Delete', 'delete', address.address_id, true));
        card.append(head, recipient, details, actions);
        addressList.append(card);
    });
}

function createAddressAction(label, action, id, isDanger = false){
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.addressId = id;
    if(isDanger) button.classList.add('delete');
    return button;
}


function resetAddressForm(){
    addressForm.reset();
    addressIdField.value = '';
    clearMapSelection();
    applyLocation({ region: 'NCR' });
    document.getElementById('address-form-title').textContent = 'Add an address';
    saveAddressButton.textContent = 'Save address';
    cancelEditButton.hidden = true;
}

addressForm.addEventListener('submit', async event => {
    event.preventDefault();
    saveAddressButton.disabled = true;
    setAddressStatus('Saving address...');
    const payload = {
        action:'save',
        address_id:addressIdField.value || null,
        address_label:document.getElementById('addressLabel').value.trim(),
        first_name:document.getElementById('firstName').value.trim(),
        last_name:document.getElementById('lastName').value.trim(),
        address_line:document.getElementById('addressLine').value.trim(),
        region: regionField.value,
        province: provinceField.value,
        city: cityField.value,
        barangay: barangayField.value,
        postal_code:document.getElementById('postalCode').value.trim(),
        phone:document.getElementById('phone').value.trim(),
        is_default:document.getElementById('isDefault').checked
    };
            try{
                const userId = getCurrentUserId();

        if (!userId) {
            throw new Error('Please sign in to save an address.');
        }

        // The address must belong to the user who is really signed in to Supabase, not just to a saved ID.
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData || !sessionData.session || sessionData.session.user.id !== userId) {
            throw new Error('Your session has expired. Please sign in again.');
        }

       const isNCR = currentRegion?.c === NCR_CODE;

        if (
            !payload.region ||
            (!isNCR && !payload.province) ||
            !payload.city ||
            !payload.barangay
        ) {
            throw new Error('Please choose your region, city and barangay.');
        }

        const recipientName = `${payload.first_name} ${payload.last_name}`.trim();

        if (!recipientName || !payload.address_line) {
            throw new Error('Please enter the recipient name and address.');
        }

        if (payload.is_default) {
            const { error: defaultError } = await supabase
                .from('user_addresses')
                .update({ is_default: false })
                .eq('user_id', userId);

            if (defaultError) throw defaultError;
        }

        const addressData = {
            user_id: userId,
            label: payload.address_label || null,
            recipient_name: recipientName,
            phone: payload.phone || null,
            address_line: payload.address_line,
            region: payload.region || 'NCR',
            barangay: payload.barangay || null,
            city: payload.city || null,
            province: payload.province,
            postal_code: payload.postal_code || null,
            is_default: payload.is_default
        };

        // Coordinates are sent only after the latitude/longitude columns exist (SAVE_ADDRESS_COORDINATES in config.ts).
        if (SAVE_ADDRESS_COORDINATES) {
            if (selectedCoords && !isValidCoords(selectedCoords.lat, selectedCoords.lng)) {
                throw new Error('The selected map location is not valid. Please pick it again.');
            }
            addressData.latitude = selectedCoords ? selectedCoords.lat : null;
            addressData.longitude = selectedCoords ? selectedCoords.lng : null;
        }

        let saveError;

        if (payload.address_id) {
            const result = await supabase
                .from('user_addresses')
                .update(addressData)
                .eq('id', payload.address_id)
                .eq('user_id', userId);

            saveError = result.error;
        } else {
            const result = await supabase
                .from('user_addresses')
                .insert(addressData);

            saveError = result.error;
        }

        if (saveError) throw saveError;

        await loadAddresses();
        resetAddressForm();
        setAddressStatus('Address saved.');
    }catch(error){
        setAddressStatus(error.message, true);
    }finally{
        saveAddressButton.disabled = false;
    }
});

cancelEditButton.addEventListener('click', resetAddressForm);
addressList.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if(!button) return;
    const address = savedAddresses.find(item => String(item.address_id) === button.dataset.addressId);
    if(!address) return;

    if(button.dataset.action === 'edit'){
        addressIdField.value = address.address_id;
        document.getElementById('addressLabel').value = address.address_label;
        document.getElementById('firstName').value = address.first_name;
        document.getElementById('lastName').value = address.last_name;
        document.getElementById('addressLine').value = address.address_line;
        await applyLocation({
            region: address.region || 'NCR',
            province: address.province || '',
            city: address.city || '',
            barangay: address.barangay || ''
        });
        document.getElementById('postalCode').value = address.postal_code;
        document.getElementById('phone').value = address.phone;
        document.getElementById('isDefault').checked = Number(address.is_default) === 1;
        showSavedLocation(address);
        document.getElementById('address-form-title').textContent = 'Edit address';
        saveAddressButton.textContent = 'Update address';
        cancelEditButton.hidden = false;
        window.scrollTo({top:0, behavior:'smooth'});
        return;
    }

    if(button.dataset.action === 'delete' && !window.confirm(`Delete the ${address.address_label} address?`)) return;
    
try {
    const userId = getCurrentUserId();

    if (!userId) {
        throw new Error('Please sign in to manage addresses.');
    }

    if (button.dataset.action === 'delete') {
        const { error } = await supabase
            .from('user_addresses')
            .delete()
            .eq('id', address.address_id)
            .eq('user_id', userId);

        if (error) throw error;

        // If the deleted address was the default, choose another address.
        if (address.is_default) {
            const { data: remaining, error: loadError } = await supabase
                .from('user_addresses')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(1);

            if (loadError) throw loadError;

            if (remaining?.length) {
                const { error: defaultError } = await supabase
                    .from('user_addresses')
                    .update({ is_default: true })
                    .eq('id', remaining[0].id)
                    .eq('user_id', userId);

                if (defaultError) throw defaultError;
            }
        }

        await loadAddresses();
        setAddressStatus('Address deleted.');
    } else if (button.dataset.action === 'default') {
        const { error: clearError } = await supabase
            .from('user_addresses')
            .update({ is_default: false })
            .eq('user_id', userId);

        if (clearError) throw clearError;

        const { error: defaultError } = await supabase
            .from('user_addresses')
            .update({ is_default: true })
            .eq('id', address.address_id)
            .eq('user_id', userId);

        if (defaultError) throw defaultError;

        await loadAddresses();
        setAddressStatus('Default address updated.');
    }
} catch (error) {
    setAddressStatus(error.message || 'Unable to manage address.', true);
}

});

loadAddresses();

;


  }
}