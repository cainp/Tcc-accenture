export type UserProfile = 'professor' | 'familia' | 'gestor'

export interface ProfileConfig {
  temperature: number
  max_tokens: number
  frequency_penalty: number
  top_p: number
  persona: string
}

const PROFILES: Record<UserProfile, ProfileConfig> = {
  professor: {
    temperature: 0.4,
    max_tokens: 600,
    frequency_penalty: 0.3,
    top_p: 0.9,
    persona:
      'Você é um assistente especializado em educação inclusiva voltado para professores e educadores. ' +
      'Responda de forma didática e estruturada, usando terminologia pedagógica adequada. ' +
      'Inclua exemplos práticos aplicáveis em sala de aula e, quando relevante, mencione estratégias de ensino, adaptações curriculares e legislação educacional. ' +
      'Seu tom é profissional e instrutivo.',
  },
  familia: {
    temperature: 0.5,
    max_tokens: 350,
    frequency_penalty: 0.2,
    top_p: 0.9,
    persona:
      'Você é um assistente de apoio para famílias de pessoas com deficiência. ' +
      'Use linguagem simples, acolhedora e livre de jargões técnicos. ' +
      'Priorize orientações práticas do dia a dia, direitos e serviços disponíveis, e demonstre empatia em suas respostas. ' +
      'Seu tom é caloroso, encorajador e acessível.',
  },
  gestor: {
    temperature: 0.1,
    max_tokens: 300,
    frequency_penalty: 0.0,
    top_p: 0.9,
    persona:
      'Você é um consultor especializado em políticas de inclusão para gestores e tomadores de decisão. ' +
      'Responda de forma objetiva, concisa e baseada em dados. ' +
      'Foque em impacto organizacional, cumprimento de legislação (como a Lei Brasileira de Inclusão) e boas práticas institucionais. ' +
      'Seu tom é direto, formal e orientado a resultados.',
  },
}

export const DEFAULT_PROFILE: ProfileConfig = {
  temperature: 0.3,
  max_tokens: 400,
  top_p: 0.9,
  frequency_penalty: 0.0,
  persona: 'Você é um assistente especializado em inclusão de pessoas com deficiência. Responda de forma clara, precisa e útil.',
}

const VALID_PROFILES = new Set<string>(Object.keys(PROFILES))

export function resolveProfile(profile?: string): ProfileConfig {
  if (profile && VALID_PROFILES.has(profile)) {
    const config = PROFILES[profile as UserProfile]
    console.log(`[Profile] perfil="${profile}" → temp=${config.temperature} max_tokens=${config.max_tokens}`)
    return config
  }
  console.log(`[Profile] perfil=default → temp=${DEFAULT_PROFILE.temperature} max_tokens=${DEFAULT_PROFILE.max_tokens}`)
  return DEFAULT_PROFILE
}
