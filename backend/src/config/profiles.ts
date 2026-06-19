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
    // temperature mais alta que gestor: respostas mais elaboradas e exemplificadas.
    temperature: 0.4,
    max_tokens: 650,
    frequency_penalty: 0.3,
    top_p: 0.9,
    persona:
      'INSTRUÇÃO FINAL: Você está respondendo a um PROFESSOR. ' +
      'Use termos pedagógicos (DUA, AEE, adaptação curricular). ' +
      'Organize em no máximo 3 tópicos curtos e práticos. Tom técnico e instrutivo. ' +
      'Seja conciso e conclua a resposta completamente dentro dos tópicos.',
  },
  familia: {
    temperature: 0.5,
    max_tokens: 450,
    frequency_penalty: 0.2,
    top_p: 0.9,
    persona:
      'INSTRUÇÃO FINAL: Você está respondendo a um FAMILIAR de pessoa com deficiência. ' +
      'Use linguagem simples, sem siglas ou jargões. Seja acolhedor e empático. ' +
      'Responda em no máximo 2 parágrafos curtos e sempre conclua completamente.',
  },
  gestor: {
    // temperature baixa para máxima previsibilidade: gestores precisam de respostas
    // objetivas baseadas em legislação, sem variação criativa.
    temperature: 0.1,
    max_tokens: 350,
    frequency_penalty: 0.0,
    top_p: 0.9,
    persona:
      'INSTRUÇÃO FINAL: Você está respondendo a um GESTOR ESCOLAR. ' +
      'Seja direto. Use no máximo 4 itens em lista numerada. ' +
      'Priorize legislação e obrigações institucionais. Conclua sempre completamente.',
  },
}

export const DEFAULT_PROFILE: ProfileConfig = {
  temperature: 0.3,
  max_tokens: 500,
  top_p: 0.9,
  frequency_penalty: 0.0,
  persona: '',
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
