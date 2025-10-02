export type KairoUser = {
  id: number | string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

const SESSION_COOKIE_NAME = 'kairo_session';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function setSessionCookie(user: KairoUser): void {
  const encoded = encodeURIComponent(btoa(JSON.stringify(user)));
  const attributes = [
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
    'Path=/',
    'SameSite=Lax'
  ];
  document.cookie = `${SESSION_COOKIE_NAME}=${encoded}; ${attributes.join('; ')}`;
}

export function clearSessionCookie(): void {
  document.cookie = `${SESSION_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getSessionUser(): KairoUser | null {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const entry = cookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!entry) return null;
  try {
    const value = entry.split('=')[1];
    const decoded = JSON.parse(atob(decodeURIComponent(value)));
    return decoded as KairoUser;
  } catch {
    return null;
  }
}

export function hasSession(): boolean {
  return getSessionUser() !== null;
}


