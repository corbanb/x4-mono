/**
 * Mock for next/navigation — provides stubs for useRouter, usePathname, useSearchParams.
 */

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  };
}

export function usePathname() {
  return '/dashboard';
}

export function useSearchParams() {
  return new URLSearchParams();
}

export function useParams() {
  return {};
}

export function redirect() {}

export function notFound() {}
