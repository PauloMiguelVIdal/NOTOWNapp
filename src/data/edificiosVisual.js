// src/data/edificiosVisual.js
// ============================================================
// MAPEAMENTO: edificioNivel + setor → nome do edifício
// Fonte única do visual da CIDADE PROGRESSO
// O nome retornado é resolvido pelo BuildingModels.js
// (via EDIFICIO_PARA_MODELO)
// ============================================================

export const EDIFICIOS_VISUAL_DEFAULT = {
  agricultura: {
    1: { nome: 'Plantação De Vegetais',                             cor4: '#4CAF50' },
    2: { nome: 'Granja De Aves',              cor4: '#4CAF50' },
    3: { nome: 'Fazenda De Vacas',                   cor4: '#4CAF50' },
    4: { nome: 'Cooperativa Agrícola',                cor4: '#4CAF50' },
    5: { nome: 'Centro De Comércio De Plantações',    cor4: '#4CAF50' },
  },
  energia: {
    1: { nome: 'Parque Eólico',                       cor4: '#FFD966' },
    2: { nome: 'Subestação De Energia',               cor4: '#FFD966' },
    3: { nome: 'Usina De Biomassa',                   cor4: '#FFD966' },
    4: { nome: 'Usina Hidrelétrica',                  cor4: '#FFD966' },
    5: { nome: 'Reator Nuclear Convencional',         cor4: '#FFD966' },
  },
  industria: {
    1: { nome: 'Fábrica De Pães',                     cor4: '#B3B3B3' },
    2: { nome: 'Fábrica De Calçados',                 cor4: '#B3B3B3' },
    3: { nome: 'Usina Siderúrgica',                   cor4: '#B3B3B3' },
    4: { nome: 'Fábrica De Robôs',                    cor4: '#B3B3B3' },
    5: { nome: 'Fábrica De Foguetes',                 cor4: '#B3B3B3' },
  },
  comercio: {
    1: { nome: 'Feira',                               cor4: '#FF4D4D' },
    2: { nome: 'Mercado',                             cor4: '#FF4D4D' },
    3: { nome: 'Centro De Distribuição',              cor4: '#FF4D4D' },
    4: { nome: 'Mega Mercado',                        cor4: '#FF4D4D' },
    5: { nome: 'Shopping Center',                     cor4: '#FF4D4D' },
  },
  imobiliario: {
    1: { nome: 'Construtora De Pequenas Obras',       cor4: '#6666FF' },
    2: { nome: 'Imobiliária Residencial',             cor4: '#6666FF' },
    3: { nome: 'Prédio De Alto Padrão',               cor4: '#6666FF' },
    4: { nome: 'Aeroporto',                           cor4: '#6666FF' },
    5: { nome: 'Porto',                               cor4: '#6666FF' },
  },
  tecnologia: {
    1: { nome: 'Startup',                             cor4: '#FF8C42' },
    2: { nome: 'Servidor Em Nuvem',                   cor4: '#FF8C42' },
    3: { nome: 'Fábrica De Smartphones',              cor4: '#FF8C42' },
    4: { nome: 'Centro De Pesquisa Em IA',            cor4: '#FF8C42' },
    5: { nome: 'Centro De Pesquisa Em Fusão Nuclear', cor4: '#FF8C42' },
  },
}

/**
 * Resolve o visual de um edifício de progresso.
 * Retorna { nome, cor4 } — o `nome` é resolvido pelo BuildingModels.
 *
 * @param {number} edificioNivel - 1 a 5
 * @param {string} setor - agricultura | energia | industria | ...
 */
export function resolverVisualEdificio(edificioNivel, setor) {
  const nivel = Math.min(5, Math.max(1, edificioNivel || 1))
  const setorValido = 'agricultura'
  return EDIFICIOS_VISUAL_DEFAULT[setorValido][nivel]
}