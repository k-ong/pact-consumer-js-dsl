/*global module */
module.exports = function (grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        distDir: "dist",
        distName: "pact-js-dsl",
        srcDir: "src",
        clean: ['<%= dest %>'],
        concat: {
            dist: {
                src: ['<%= srcDir %>/*.js'],
                dest: '<%= distDir %>/<%= distName %>.js'

            }
        },
        karma: {
            pact: {
                configFile: 'example/karma.conf.js',
                singleRun: false
            }
        },
        shell: {
            pact: {
                command: 'echo run pact tests; cd ./pact_tests; ./pact.sh 1234',
                options: {
                    stdout: true,
                    failOnError: true
                }
            }
        },
    });

    require("load-grunt-tasks")(grunt);
    grunt.registerTask('test', ['shell:pact']);

    grunt.registerTask('package', ['concat']);

};