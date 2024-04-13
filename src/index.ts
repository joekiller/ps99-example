import {PetSimulator99API, RAPResponseBody} from 'ps99-api';

const ps99api = new PetSimulator99API()

function logDesc(desc: string, obj: unknown) {
  console.log(desc, JSON.stringify(obj, null, 2))
}

type RAPTotal = RAPResponseBody['data'][number] & {total: number}

interface RAPMap  {
  n:RAPTotal[]
  g:RAPTotal[]
  s:RAPTotal[]
  gs:RAPTotal[]
  r:RAPTotal[]
  rs:RAPTotal[]
}

function rapReduce(totalOf: {[key: string]: number}, m:RAPMap, _c: RAPResponseBody['data'][number], i: number, a: RAPResponseBody['data']) {
  const c: RAPTotal = {..._c, total: totalOf[_c.configData.id]}
  c.value = c.value / 1000000
  if(c.configData && 'sh' in c.configData && c.configData.sh){
    if('pt' in c.configData && c.configData.pt===2) {
      c.configData.id = c.configData.id.slice(5)
      c.configData.id = `Huge Shiny Rainbow ${c.configData.id}`
      m.rs.push(c)
    }
    else if('pt' in c.configData && c.configData.pt===1) {
      c.configData.id = c.configData.id.slice(5)
      c.configData.id = `Huge Shiny Golden ${c.configData.id}`
      m.gs.push(c)
    }
    else {
      c.configData.id = c.configData.id.slice(5)
      c.configData.id = `Huge Shiny ${c.configData.id}`
      m.s.push(c)
    }
  } else if ('pt' in c.configData && c.configData.pt === 2) {
    c.configData.id = c.configData.id.slice(5)
    c.configData.id = `Huge Rainbow ${c.configData.id}`
    m.r.push(c)
  }
  else if ('pt' in c.configData && c.configData.pt === 1) {
    c.configData.id = c.configData.id.slice(5)
    c.configData.id = `Huge Golden ${c.configData.id}`
    m.g.push(c)
  }
  else
    m.n.push(c)
  return m
}

async function main() {
  const {data: totals } = await ps99api.getExists()
  const totalOf: {[key: string]: number} = {}
  totals.forEach(t => {
    totalOf[t.configData.id] = t.value
  });
  const common = totals.filter(p => p.configData.id.startsWith('Huge ') && p.category === 'Pet')
    .sort((a,b) => a.value - b.value).filter(p => p.value > 300).map(p => p.configData.id)
  const {data: RAP} = await ps99api.getRAP()
  logDesc('RAP', RAP);
  const rapMap: RAPMap = {
    n:[],
    g:[],
    s:[],
    gs:[],
    r:[],
    rs:[]
  }
  const _rapReduce = (m:RAPMap, c: RAPResponseBody['data'][number], i: number, a: RAPResponseBody['data']) => rapReduce(totalOf, m, c, i, a)
  const reducedByValue = RAP.filter(p => p.configData.id.startsWith('Huge ') && p.category === 'Pet' && common.includes(p.configData.id) && p.value)
    .sort((a,b) => a.value - b.value)
    .reduce(_rapReduce,rapMap)
  const byTotalDesc: RAPMap = {
    n: reducedByValue.n.slice().sort((a, b) => b.total - a.total),
    g: reducedByValue.g.slice().sort((a, b) => b.total - a.total),
    s: reducedByValue.s.slice().sort((a, b) => b.total - a.total),
    gs: reducedByValue.gs.slice().sort((a, b) => b.total - a.total),
    r: reducedByValue.g.slice().sort((a, b) => b.total - a.total),
    rs: reducedByValue.rs.slice().sort((a, b) => b.total - a.total)
  }
  const flattened = Object.values(rapMap)
    .flatMap((f) => f)
    .map(f => ({name: f.configData.id, value: f.value}))
    .sort((a,b) => a.value - b.value)
  JSON.stringify(reducedByValue, null, 2)
}

main().catch(e => console.error(e));
