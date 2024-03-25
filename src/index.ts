import {PetSimulator99API} from 'ps99-api';

const ps99api = new PetSimulator99API()

function logDesc(desc: string, obj: unknown) {
  console.log(desc, JSON.stringify(obj, null, 2))
}

async function main() {
  const {data: collections} = await ps99api.getCollections()
  logDesc('collections', collections);
  for (const c of collections) {
    const {data} = await ps99api.getCollection(c);
    logDesc(`collection ${c}`, data);
  }
  const {data: exists} = await ps99api.getExists()
  logDesc('exists', exists);
  const {data: RAP} = await ps99api.getRAP()
  logDesc('RAP', RAP);
  const {data: activeClanBattle} = await ps99api.getActiveClanBattle()
  logDesc('activeClanBattle', activeClanBattle);
}

main().catch(e => console.error(e));
