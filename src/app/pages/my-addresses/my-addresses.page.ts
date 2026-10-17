// @ts-nocheck  (legacy script below is plain JavaScript carried over from my-addresses.html)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './my-addresses.markup';
import { supabase } from '../../../services/supabase.service';

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
const cityField = document.getElementById('city');
const barangayField = document.getElementById('barangay');

const PSGC_API = 'https://psgc.gitlab.io/api';

async function fetchPSGC(path) {
    const response = await fetch(`${PSGC_API}${path}`);

    if (!response.ok) {
        throw new Error('Unable to load Philippine address data. Please try again.');
    }

    return response.json();
}

function fillDropdown(select, items, placeholder, selectedValue = '') {
    select.replaceChildren();

    const firstOption = document.createElement('option');
    firstOption.value = '';
    firstOption.textContent = placeholder;
    select.append(firstOption);

    items.sort((a, b) => a.name.localeCompare(b.name));

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        option.dataset.code = item.code;
        select.append(option);
    });

    select.value = selectedValue;
}

async function loadNCRCities(selectedCity = '') {
    cityField.disabled = true;
    barangayField.disabled = true;

    try {
        const cities = await fetchPSGC('/regions/130000000/cities-municipalities/');
        fillDropdown(cityField, cities, 'Select city', selectedCity);
        cityField.disabled = false;

        if (selectedCity && cityField.value) {
            await loadBarangays('', selectedCity);
        }
    } catch (error) {
        setAddressStatus(error.message, true);
    }
}

async function loadBarangays(selectedBarangay = '', selectedCity = '') {
    const cityName = selectedCity || cityField.value;
    const cityOption = [...cityField.options].find(option => option.value === cityName);
    const cityCode = cityOption?.dataset.code;

    barangayField.disabled = true;
    fillDropdown(barangayField, [], 'Select barangay');

    if (!cityCode) return;

    try {
        const barangays = await fetchPSGC(`/cities-municipalities/${cityCode}/barangays/`);
        fillDropdown(barangayField, barangays, 'Select barangay', selectedBarangay);
        barangayField.disabled = false;
    } catch (error) {
        setAddressStatus(error.message, true);
    }
}

cityField.addEventListener('change', () => {
    loadBarangays();
});

loadNCRCities();


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
            province: null,
            postal_code: payload.postal_code || null,
            is_default: payload.is_default
        };

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
        regionField.value = address.region || 'NCR';
        await loadNCRCities(address.city || '');

        if (address.city) {
            await loadBarangays(address.barangay || '', address.city);
        }
        document.getElementById('postalCode').value = address.postal_code;
        document.getElementById('phone').value = address.phone;
        document.getElementById('isDefault').checked = Number(address.is_default) === 1;
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
