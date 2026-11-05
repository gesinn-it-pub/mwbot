/**
 * Thrown by batch() when a job uses an operation that is not supported.
 */
class UnsupportedOperationError extends Error {
    constructor(operation) {
        super('Unsupported operation: ' + operation);
        this.name = 'UnsupportedOperationError';
    }
}

export default UnsupportedOperationError;
