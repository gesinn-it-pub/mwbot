'use strict';
module.exports = function(grunt) {

    // Show elapsed time at the end
    require('time-grunt')(grunt);

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        eslint: {
            js: {
                src: ['src/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        mochacli: {
            options: {
                reporter: 'spec',
                bail: true,
                force: true,
                timeout: 16000
            },
            all: ['test/**/*.spec.js']
        },
        mocha_istanbul: {
            coverage: {
                src: ['test/'],
                options: {
                    mask: '*.prod.spec.js',
                    coverage: true,
                    reportFormats: ['lcov', 'text', 'clover']
                }
            }
        }
    });

    // Default task.
    grunt.registerTask('lint', ['eslint']);
    grunt.registerTask('test-coverage', ['mocha_istanbul:coverage']);
    grunt.registerTask('default', ['lint', 'test-coverage', 'doc']);

    grunt.event.on('coverage', function(content, done) {
        done();
    });
};
