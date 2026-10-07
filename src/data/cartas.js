// src/data/cartas.js
// ============================================================
// CATÁLOGO DE CARTAS DO FITCITY
// Gerado a partir do InventoryScreen.jsx
// ============================================================

// ── Helpers de slug ──
const slugify = (nome) =>
  nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .replace(/[^a-z0-9]+/g, '-')       // espaços/símbolos → hífen
    .replace(/^-+|-+$/g, '')           // remove hífens nas pontas

// ============================================================
// MAPA DE SETOR (do InventoryScreen)
// ============================================================
const MAPA_SETOR = {
  // ── Agricultura ──
  "Plantação De Grãos": "agricultura",
  "Plantação De Vegetais": "agricultura",
  "Fazenda Administrativa": "agricultura",
  "Pomares": "agricultura",
  "Cooperativa Agrícola": "agricultura",
  "Centro De Comércio De Plantações": "agricultura",
  "Fazenda De Vacas": "agricultura",
  "Granja De Aves": "agricultura",
  "Criação De Ovinos": "agricultura",
  "Armazém": "agricultura",
  "Silo": "agricultura",
  "Depósito De Resíduos Orgânicos": "agricultura",
  "Serraria": "agricultura",
  "Área Florestal": "agricultura",
  "Terreno De Mineração": "agricultura",
  "Plantação De Eucalipto": "agricultura",
  "Plantação De Plantas Medicinais": "agricultura",
  "Campo De Estocagem": "agricultura",
  "Pátio De Mineração": "agricultura",

  // ── Indústria ──
  "Fábrica De Móveis": "industria",
  "Fábrica De Rações": "industria",
  "Fábrica De Embalagens": "industria",
  "Fábrica De Fertilizantes": "industria",
  "Fábrica De Bebidas": "industria",
  "Fábrica De Pães": "industria",
  "Fábrica Têxtil": "industria",
  "Fábrica De Calçados": "industria",
  "Fábrica De Roupas": "industria",
  "Fábrica De Celulose": "industria",
  "Fábrica De Papel": "industria",
  "Fábrica De Livros": "industria",
  "Fábrica De Medicamentos": "industria",
  "Laboratório Farmacêutico": "industria",
  "Fábrica De Plásticos": "industria",
  "Fábrica De Químicos Especializados": "industria",
  "Alto-Forno": "industria",
  "Usina Siderúrgica": "industria",
  "Fundição De Alumínio": "industria",
  "Fábrica De Ligas Metálicas": "industria",
  "Indústria De Componentes Mecânicos": "industria",
  "Fábrica De Chapas Metálicas": "industria",
  "Fábrica De Estruturas Metálicas": "industria",
  "Fábrica De Peças Automotivas": "industria",
  "Montadora De Veículos Elétricos": "industria",
  "Fábrica De Automóveis": "industria",
  "Refinaria De Biocombustíveis": "industria",
  "Refinaria": "industria",
  "Biofábrica": "industria",
  "Fábrica De Chips": "industria",
  "Fábrica De Placas Eletrônicas": "industria",
  "Fábrica De Semicondutores": "industria",
  "Fábrica De Eletrônicos": "industria",
  "Fábrica De Robôs": "industria",
  "Empresa De Automação Industrial": "industria",
  "Fábrica De Motores": "industria",
  "Fábrica De Foguetes": "industria",
  "Fábrica De Aeronaves": "industria",
  "Estaleiro": "industria",
  "Container Modular": "industria",
  "Pátio De Veículos": "industria",

  // ── Tecnologia ──
  "Startup": "tecnologia",
  "Servidor Em Nuvem": "tecnologia",
  "Data Center": "tecnologia",
  "Empresa De Desenvolvimento De Software": "tecnologia",
  "Empresa De Jogos Digitais": "tecnologia",
  "Empresa De Telecomunicações": "tecnologia",
  "Plataforma De Redes Sociais": "tecnologia",
  "Marketplace Online": "tecnologia",
  "Plataforma De Streaming": "tecnologia",
  "Fábrica De Smartphones": "tecnologia",
  "Fábrica De Computadores": "tecnologia",
  "Fábrica De Consoles De Jogos": "tecnologia",
  "Fábrica De Dispositivos Vestíveis": "tecnologia",
  "Instituto De Tecnologia Alimentar": "tecnologia",
  "Centro De Pesquisa Agrícola": "tecnologia",
  "Instituto De Biotecnologia": "tecnologia",
  "Laboratório De Nanotecnologia": "tecnologia",
  "Centro De Pesquisa Em Eletrônicos": "tecnologia",
  "Laboratório De Design De Produtos": "tecnologia",
  "Centro De Pesquisa Química": "tecnologia",
  "Centro De Pesquisa Em Fusão Nuclear": "tecnologia",
  "Laboratório De Novos Combustíveis": "tecnologia",
  "Centro De Pesquisa Aeroespacial": "tecnologia",
  "Centro De Engenharia Avançada": "tecnologia",
  "Centro De Pesquisa Em Materiais": "tecnologia",
  "Centro De Pesquisa Em Robótica": "tecnologia",
  "Centro De Pesquisa Em IA": "tecnologia",

  // ── Comércio ──
  "Feira": "comercio",
  "Loja De Móveis": "comercio",
  "Restaurante": "comercio",
  "Livraria": "comercio",
  "Mercado": "comercio",
  "Adega": "comercio",
  "Câmara Fria": "comercio",
  "Padaria": "comercio",
  "Açougue": "comercio",
  "Loja De Conveniência": "comercio",
  "Posto De Combustíveis": "comercio",
  "Rede De Fast-Food": "comercio",
  "Petshop": "comercio",
  "Farmácia": "comercio",
  "Cafeteria": "comercio",
  "Loja De Departamentos": "comercio",
  "Loja De Calçados": "comercio",
  "Loja De Vestuário": "comercio",
  "Loja De Gadgets E Wearables": "comercio",
  "Loja De Games": "comercio",
  "Loja De Celulares": "comercio",
  "Loja De Informática": "comercio",
  "Loja De Eletrônicos": "comercio",
  "Joalheria": "comercio",
  "Concessionária De Veículos": "comercio",
  "Shopping Popular": "comercio",
  "Shopping Center": "comercio",
  "Centro De Transporte E Entrega": "comercio",
  "Centro De Distribuição": "comercio",
  "Armazém Logístico": "comercio",
  "Transporte Petrolífero": "comercio",

  // ── Imobiliário ──
  "Cartório E Licenças": "imobiliario",
  "Terraplanagem E Pavimentação": "imobiliario",
  "Construtora De Pequenas Obras": "imobiliario",
  "Escritório De Design De Interiores": "imobiliario",
  "Escritório De Arquitetura": "imobiliario",
  "Consultoria Em Engenharia Civil": "imobiliario",
  "Construtora": "imobiliario",
  "Imobiliária Residencial": "imobiliario",
  "Imobiliária Comercial": "imobiliario",
  "Construtora De Infraestruturas": "imobiliario",
  "Aeroporto": "imobiliario",
  "Porto": "imobiliario",
  "Mineradora": "imobiliario",
  "Mineradora Radioativa": "imobiliario",
  "Mineradora De Pedras Preciosas": "imobiliario",
  "Mega Mercado": "imobiliario",
  "Prédio De Alto Padrão": "imobiliario",
  "Centro De Coleta De Biomassa": "imobiliario",
  "Tanque De Armazenamento De Fluidos": "imobiliario",
  "Plataforma De Petróleo": "imobiliario",
  "Hangar": "imobiliario",

  // ── Energia ──
  "Subestação De Energia": "energia",
  "Rede De Distribuição Elétrica": "energia",
  "Fábrica De Turbinas Eólicas": "energia",
  "Fábrica De Baterias": "energia",
  "Empresa De Comércio Energético": "energia",
  "Empresa De Consultoria Energética": "energia",
  "Estação De Carregamento": "energia",
  "Centro De Pesquisa Em Energias Renováveis": "energia",
  "Centro De Pesquisa Energética": "energia",
  "Centro De Reciclagem De Baterias": "energia",
  "Usina Termelétrica A Biocombustíveis": "energia",
  "Usina De Biomassa": "energia",
  "Usina Hidrelétrica": "energia",
  "Parque Eólico": "energia",
  "Usina Termelétrica": "energia",
  "Reator Nuclear Convencional": "energia",
  "Usina De Fusão Nuclear": "energia",
}

// ============================================================
// RANKS (do InventoryScreen — getRank)
// ============================================================
const RANK_S = [
  "Usina Hidrelétrica", "Reator Nuclear Convencional", "Usina De Fusão Nuclear",
  "Shopping Popular", "Shopping Center", "Fábrica De Computadores",
  "Construtora De Infraestruturas", "Aeroporto", "Porto", "Mineradora Radioativa",
  "Plataforma De Petróleo", "Montadora De Veículos Elétricos", "Fábrica De Automóveis",
  "Refinaria", "Fábrica De Chips", "Fábrica De Semicondutores", "Fábrica De Robôs",
  "Fábrica De Motores", "Fábrica De Foguetes", "Fábrica De Aeronaves"
]

const RANK_A = [
  "Cooperativa Agrícola", "Usina De Biomassa", "Transporte Petrolífero",
  "Marketplace Online", "Plataforma De Streaming", "Fábrica De Smartphones",
  "Fábrica De Consoles De Jogos", "Fábrica De Dispositivos Vestíveis",
  "Centro De Pesquisa Em Fusão Nuclear", "Centro De Pesquisa Aeroespacial",
  "Centro De Engenharia Avançada", "Centro De Pesquisa Em Materiais",
  "Centro De Pesquisa Em IA", "Mineradora De Pedras Preciosas", "Mega Mercado",
  "Prédio De Alto Padrão", "Tanque De Armazenamento Biocombustível",
  "Fábrica De Químicos Especializados", "Alto-Forno", "Usina Siderúrgica",
  "Fundição De Alumínio", "Fábrica De Ligas Metálicas", "Fábrica De Peças Automotivas",
  "Refinaria De Biocombustíveis", "Biofábrica", "Fábrica De Eletrônicos",
  "Empresa De Automação Industrial", "Estaleiro"
]

const RANK_B = [
  "Centro De Comércio De Plantações", "Empresa De Comércio Energético",
  "Empresa De Consultoria Energética", "Centro De Pesquisa Em Energias Renováveis",
  "Centro De Pesquisa Energética", "Usina Termelétrica A Biocombustíveis",
  "Usina Termelétrica", "Joalheria", "Concessionária De Veículos",
  "Centro De Distribuição", "Armazém Logístico", "Servidor Em Nuvem", "Data Center",
  "Empresa De Desenvolvimento De Software", "Empresa De Jogos Digitais",
  "Empresa De Telecomunicações", "Plataforma De Redes Sociais",
  "Instituto De Tecnologia Alimentar", "Centro De Pesquisa Agrícola",
  "Instituto De Biotecnologia", "Laboratório De Nanotecnologia",
  "Centro De Pesquisa Em Eletrônicos", "Laboratório De Design De Produtos",
  "Laboratório De Novos Combustíveis", "Centro De Engenharia Avançada",
  "Centro De Pesquisa Em Robótica", "Construtora", "Imobiliária Residencial",
  "Imobiliária Comercial", "Mineradora", "Centro De Coleta De Biomassa",
  "Fábrica De Fertilizantes", "Fábrica De Medicamentos", "Laboratório Farmacêutico",
  "Fábrica De Plásticos", "Indústria De Componentes Mecânicos",
  "Fábrica De Chapas Metálicas", "Fábrica De Estruturas Metálicas",
  "Fábrica De Placas Eletrônicas",
]

const getRank = (nome) => {
  if (RANK_S.includes(nome)) return 'S'
  if (RANK_A.includes(nome)) return 'A'
  if (RANK_B.includes(nome)) return 'B'
  return 'C'
}

const RANK_PARA_RARIDADE = {
  S: 'lendario',
  A: 'epico',
  B: 'raro',
  C: 'comum',
}

// ============================================================
// LISTA DE CARTAS (do InventoryScreen — CARTAS_FITCITY)
// Extraímos apenas os NOMES (quantidade é do inventário, não do catálogo)
// ============================================================
const NOMES_CARTAS = [
  "Terreno De Mineração",
  "Pátio De Mineração",
  "Pomares",
  "Depósito De Resíduos Orgânicos",
  "Plantação De Grãos",
  "Serraria",
  "Plantação De Eucalipto",
  "Cooperativa Agrícola",
  "Centro De Comércio De Plantações",
  "Área Florestal",
  "Subestação De Energia",
  "Campo De Estocagem",
  "Silo",
  "Fazenda De Vacas",
  "Granja De Aves",
  "Fábrica De Rações",
  "Fábrica De Papel",
  "Fábrica De Pães",
  "Container Modular",
  "Pátio De Veículos",
  "Fábrica De Calçados",
  "Fábrica De Bebidas",
  "Laboratório Farmacêutico",
  "Fábrica De Motores",
  "Fábrica De Robôs",
  "Usina Siderúrgica",
  "Fábrica De Ligas Metálicas",
  "Fábrica De Peças Automotivas",
  "Fábrica De Smartphones",
  "Empresa De Automação Industrial",
  "Startup",
  "Servidor Em Nuvem",
  "Empresa De Desenvolvimento De Software",
  "Centro De Pesquisa Em Fusão Nuclear",
  "Centro De Pesquisa Aeroespacial",
  "Feira",
  "Loja De Móveis",
  "Farmácia",
  "Câmara Fria",
  "Mercado",
  "Loja De Calçados",
  "Posto De Combustíveis",
  "Centro De Distribuição",
  "Concessionária De Veículos",
  "Transporte Petrolífero",
  "Shopping Popular",
  "Shopping Center",
  "Mega Mercado",
  "Construtora De Pequenas Obras",
  "Cartório E Licenças",
  "Escritório De Arquitetura",
  "Consultoria Em Engenharia Civil",
  "Escritório De Design De Interiores",
  "Construtora",
  "Imobiliária Residencial",
  "Imobiliária Comercial",
  "Construtora De Infraestruturas",
  "Hangar",
  "Mineradora",
  "Plataforma De Petróleo",
  "Centro De Coleta De Biomassa",
  "Tanque De Armazenamento De Fluidos",
  "Estação De Carregamento",
  "Centro De Pesquisa Energética",
  "Empresa De Comércio Energético",
  "Usina De Biomassa",
  "Parque Eólico",
  "Fábrica De Turbinas Eólicas",
  "Usina Hidrelétrica",
  "Usina Termelétrica A Biocombustíveis",
  "Usina Termelétrica",
  "Reator Nuclear Convencional",
  "Usina De Fusão Nuclear",
  "Aeroporto",
  "Porto",
  "Estaleiro",
  "Fábrica De Aeronaves",
  "Fábrica De Foguetes",
  "Criação De Ovinos",
  "Prédio De Alto Padrão",
  "Armazém",
]

// ============================================================
// CONSTRUÇÃO DO CATÁLOGO
// ============================================================
const construirCatalogo = () => {
  const catalogo = {}

  NOMES_CARTAS.forEach((nome) => {
    const rank = getRank(nome)
    const raridade = RANK_PARA_RARIDADE[rank]
    const setor = MAPA_SETOR[nome] || 'outros'
    const id = slugify(nome)

    catalogo[id] = {
      id,
      nome,
      rank,
      raridade,
      setor,
    }
  })

  return catalogo
}

export const CARTAS_CATALOGO = construirCatalogo()

// ============================================================
// CONFIGURAÇÃO DE RARIDADES
// ============================================================
export const RARIDADES_CONFIG = {
  comum: {
    peso: 1,
    qtdMaxima: 100,
    quantidadeMinimaNv2: 20,
    quantidadeMinimaNv3: 50,
  },
  raro: {
    peso: 5,
    qtdMaxima: 80,
    quantidadeMinimaNv2: 15,
    quantidadeMinimaNv3: 40,
  },
  epico: {
    peso: 25,
    qtdMaxima: 50,
    quantidadeMinimaNv2: 10,
    quantidadeMinimaNv3: 20,
  },
  lendario: {
    peso: 100,
    qtdMaxima: 10,
    quantidadeMinimaNv2: 2,
    quantidadeMinimaNv3: 5,
  },
}

// ============================================================
// MULTIPLICADORES POR NÍVEL DA CARTA
// ============================================================
export const MULTIPLICADORES_NIVEL = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,   // MAX
}

// ============================================================
// HELPERS DE CONSULTA
// ============================================================

// Busca carta por ID (slug)
export const getCarta = (cartaId) => CARTAS_CATALOGO[cartaId] || null

// Busca carta por nome
export const getCartaPorNome = (nome) =>
  Object.values(CARTAS_CATALOGO).find((c) => c.nome === nome) || null

// Lista cartas por raridade
export const getCartasPorRaridade = (raridade) =>
  Object.values(CARTAS_CATALOGO).filter((c) => c.raridade === raridade)

// Lista cartas por setor
export const getCartasPorSetor = (setor) =>
  Object.values(CARTAS_CATALOGO).filter((c) => c.setor === setor)

// Total de cartas no catálogo
export const TOTAL_CARTAS = Object.keys(CARTAS_CATALOGO).length

// Distribuição por raridade
export const DISTRIBUICAO_RARIDADES = Object.values(CARTAS_CATALOGO).reduce(
  (acc, carta) => {
    acc[carta.raridade] = (acc[carta.raridade] || 0) + 1
    return acc
  },
  { comum: 0, raro: 0, epico: 0, lendario: 0 }
)

// Distribuição por setor
export const DISTRIBUICAO_SETORES = Object.values(CARTAS_CATALOGO).reduce(
  (acc, carta) => {
    acc[carta.setor] = (acc[carta.setor] || 0) + 1
    return acc
  },
  {}
)