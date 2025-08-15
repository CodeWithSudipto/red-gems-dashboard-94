import { customAlphabet } from 'nanoid';

// Generate a unique 9-digit string
export function generateSecureCode(): string {
  const alphabet = '0123456789';
  const nanoid = customAlphabet(alphabet, 9);
  return nanoid();
}

// Generate a short unique ID
export function uid(): string {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 12);
  return nanoid();
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (basic)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Currency formatter
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Date formatter
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

// Generate ISO timestamp
export function now(): string {
  return new Date().toISOString();
}

// Check if code exists in repository (for secure code uniqueness)
export async function isSecureCodeUnique(
  code: string,
  checkFunction: (code: string) => Promise<boolean>
): Promise<string> {
  let uniqueCode = code;
  while (!(await checkFunction(uniqueCode))) {
    uniqueCode = generateSecureCode();
  }
  return uniqueCode;
}

// Generate IMEI-like number for products
export function generateIMEINumber(productId: string): string {
  const base = productId.slice(0, 5).padEnd(5, '0');
  const rand = Math.floor(Math.random() * 1_0000_0000).toString().padStart(10, '0');
  return `${base}${rand}`; // 15 digits
}