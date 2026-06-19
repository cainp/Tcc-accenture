export type UserProfile = 'professor' | 'familia' | 'gestor'

export interface GenerationPreset {
  temperature: number
  max_tokens: number
  frequency_penalty: number
  top_p: number
}

// Presets por perfil — valores definidos pelo projeto Diversa
const PRESETS: Record<UserProfile, GenerationPreset> = {
  professor: { temperature: 0.4, max_tokens: 600, frequency_penalty: 0.3, top_p: 0.9 },
  familia:   { temperature: 0.5, max_tokens: 350, frequency_penalty: 0.2, top_p: 0.9 },
  gestor:    { temperature: 0.1, max_tokens: 300, frequency_penalty: 0.0, top_p: 0.9 },
}

// Usado quando nenhum perfil for informado ou o valor for inválido
export const DEFAULT_PRESET: GenerationPreset = {
  temperature: 0.3,
  max_tokens: 400,
  top_p: 0.9,
  frequency_penalty: 0.0,
}

const VALID_PROFILES = new Set<string>(Object.keys(PRESETS))

export function resolvePreset(profile?: string): GenerationPreset {
  if (profile && VALID_PROFILES.has(profile)) {
    const preset = PRESETS[profile as UserProfile]
    console.log(`[Profile] perfil="${profile}" → temp=${preset.temperature} max_tokens=${preset.max_tokens}`)
    return preset
  }
  console.log(`[Profile] perfil=default → temp=${DEFAULT_PRESET.temperature} max_tokens=${DEFAULT_PRESET.max_tokens}`)
  return DEFAULT_PRESET
}
