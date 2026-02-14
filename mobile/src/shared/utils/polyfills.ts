import 'text-encoding';

// Polyfill for TextEncoder/TextDecoder if not available globally
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = require('text-encoding').TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = require('text-encoding').TextDecoder;
}
