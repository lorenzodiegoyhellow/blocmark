import { storage } from './storage';

console.log('Testing storage import...');
console.log('Type of storage:', typeof storage);
console.log('Storage keys:', Object.keys(storage));
console.log('Has getReviewsByBookingIds?', typeof storage.getReviewsByBookingIds);

// List all methods on storage
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(storage));
console.log('All storage methods:', methods.filter(m => m.startsWith('get')));