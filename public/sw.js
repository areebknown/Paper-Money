/**
 * Pusher Beams Service Worker
 * 
 * This file MUST stay at /public/sw.js so the browser can register it at the root scope.
 * It handles incoming push notifications from Pusher Beams and shows them natively.
 */

// Import the Pusher Beams service worker helper
importScripts('https://js.pusher.com/beams/service-worker.js');
