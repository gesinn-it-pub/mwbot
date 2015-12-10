'use strict';
module.exports = function(grunt) {

    // Show elapsed time at the end
    require('time-grunt')(grunt);

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            js: {
                src: ['src/**/*.js']
            },
            test: {
                src: ['test/**/*.js']
            }
        },
        jscs: {
            options: {
                config: '.jscsrc',
                force: true
            },
            js: {
                src: ['*.js']
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
                    mask: '*.spec.js',
                    coverage: true,
                    reportFormats: ['lcov', 'text']
                }
            }
        },
        release: {
            options: {

            }
        }
    });

    // Default task.
    grunt.registerTask('lint', ['eslint', 'jscs']);
    grunt.registerTask('test', ['mochacli']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
    grunt.registerTask('default', ['lint', 'coverage']);
    grunt.registerTask('publish', ['release']);

    grunt.event.on('coverage', function(content, done) {
        done();
    });
};
