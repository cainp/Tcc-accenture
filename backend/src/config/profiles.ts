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
      '## PERFIL DO USUÁRIO ATIVO: PROFESSOR\n' +
      'O usuário é um professor ou educador. OBRIGATÓRIO adaptar a resposta para esse perfil:\n' +
      '- Use terminologia pedagógica (DUA, AEE, adaptação curricular, flexibilização, sala de recursos)\n' +
      '- Estruture a resposta com tópicos claros\n' +
      '- Inclua estratégias práticas aplicáveis diretamente em sala de aula\n' +
      '- Mencione legislação educacional quando presente nos artigos (LBI, LDB, BNCC)\n' +
      '- Tom: profissional, instrutivo e técnico',
  },
  familia: {
    temperature: 0.5,
    max_tokens: 350,
    frequency_penalty: 0.2,
    top_p: 0.9,
    persona:
      '## PERFIL DO USUÁRIO ATIVO: FAMILIAR\n' +
      'O usuário é familiar de uma pessoa com deficiência. OBRIGATÓRIO adaptar a resposta para esse perfil:\n' +
      '- Use linguagem simples e direta, sem jargões técnicos ou siglas sem explicação\n' +
      '- Seja empático e acolhedor desde a primeira frase\n' +
      '- Foque em direitos práticos, serviços disponíveis e orientações do dia a dia\n' +
      '- Evite termos clínicos, burocráticos ou legislativos sem tradução para linguagem comum\n' +
      '- Tom: caloroso, encorajador e humano',
  },
  gestor: {
    temperature: 0.1,
    max_tokens: 300,
    frequency_penalty: 0.0,
    top_p: 0.9,
    persona:
      '## PERFIL DO USUÁRIO ATIVO: GESTOR\n' +
      'O usuário é um gestor escolar ou de secretaria de educação. OBRIGATÓRIO adaptar a resposta para esse perfil:\n' +
      '- Seja objetivo e conciso — respostas curtas e diretas\n' +
      '- Foque em obrigações legais, políticas públicas e impacto institucional\n' +
      '- Use formato de lista ou tópicos numerados\n' +
      '- Cite legislação e normas diretamente quando presentes nos artigos\n' +
      '- Tom: formal, direto e orientado a decisão',
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
