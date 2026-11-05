import MWBot from './MWBot.js';

// Named, default and CommonJS interop export: `import MWBot from 'mwbot'`, `import { MWBot } from 'mwbot'`
// and `const MWBot = require('mwbot')` (Node.js >= 22.13) all return the class.
export default MWBot;
export { MWBot, MWBot as 'module.exports' };
