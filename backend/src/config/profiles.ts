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
    max_tokens: 600,
    frequency_penalty: 0.3,
    top_p: 0.9,
    persona:
      'INSTRUÇÃO FINAL: Você está respondendo a um PROFESSOR. ' +
      'Use termos pedagógicos (DUA, AEE, adaptação curricular). ' +
      'Organize em tópicos práticos aplicáveis em sala de aula. Tom técnico e instrutivo.',
  },
  familia: {
    temperature: 0.5,
    max_tokens: 350,
    frequency_penalty: 0.2,
    top_p: 0.9,
    persona:
      'INSTRUÇÃO FINAL: Você está respondendo a um FAMILIAR de pessoa com deficiência. ' +
      'Use linguagem simples, sem siglas ou jargões. ' +
      'Seja acolhedor e empático. Foque em direitos e orientações práticas do dia a dia.',
  },
  gestor: {
    // temperature baixa para máxima previsibilidade: gestores precisam de respostas
    // objetivas baseadas em legislação, sem variação criativa.
    temperature: 0.1,
    max_tokens: 300,
    frequency_penalty: 0.0,
    top_p: 0.9,
    persona:
      'INSTRUÇÃO FINAL: Você está respondendo a um GESTOR ESCOLAR. ' +
      'Seja direto e conciso. Use listas numeradas. ' +
      'Priorize legislação, obrigações institucionais e impacto organizacional.',
  },
}

export const DEFAULT_PROFILE: ProfileConfig = {
  temperature: 0.3,
  max_tokens: 400,
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
