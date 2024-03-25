import {PetSimulator99API} from 'ps99-api';

const ps99api = new PetSimulator99API()
ps99api.getExists().then(e => console.log(JSON.stringify(e, null, 2)));
