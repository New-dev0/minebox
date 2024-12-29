import md5 from 'md5'

export function getGravatarUrl(email: string, size: number = 200): string {
  const hash = md5(email.toLowerCase().trim())
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=g`
} 