/**
 * Operations that can be used in batch() jobs, mapped to the bot method they invoke.
 * The job array supplies the method arguments: [operation, ...args].
 */
const BATCH_OPERATIONS = {
    create: (bot, ...args) => bot.create(...args),
    createProtect: (bot, ...args) => bot.createProtect(...args),
    read: (bot, ...args) => bot.read(...args),
    readFromID: (bot, ...args) => bot.readFromID(...args),
    readWithProps: (bot, ...args) => bot.readWithProps(...args),
    readWithPropsFromID: (bot, ...args) => bot.readWithPropsFromID(...args),
    edit: (bot, ...args) => bot.edit(...args),
    editProtect: (bot, ...args) => bot.editProtect(...args),
    update: (bot, ...args) => bot.update(...args),
    updateFromID: (bot, ...args) => bot.updateFromID(...args),
    delete: (bot, ...args) => bot.delete(...args),
    protect: (bot, ...args) => bot.protect(...args),
    move: (bot, ...args) => bot.move(...args),
    upload: (bot, ...args) => bot.upload(...args),
    uploadOverwrite: (bot, ...args) => bot.uploadOverwrite(...args),
};

export default BATCH_OPERATIONS;
