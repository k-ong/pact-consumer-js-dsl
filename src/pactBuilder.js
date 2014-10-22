define('pactBuilder', ['jquery', 'pact'],
    function($, Pact) {
        var _host = "http://127.0.0.1"; 
        var _port= "";

        function PactBuilder(consumerName, providerName, port) {
            _port = port;
            this.pact = new Pact();
            this.pact.consumer.name = consumerName;
            this.pact.provider.name = providerName;
            for (var prop in this) {
                PactBuilder.prototype[prop] = this[prop];
            }
        }

        PactBuilder.prototype.withInteractions = function(interactions) {
            for (var index in interactions) {
                this.pact.interactions.push(interactions[index]);
            }
            return this;
        };

        PactBuilder.prototype.clean = function(){
             $.ajax({
                url: _host+":"+_port+"/interactions",
                type: "DELETE",
                beforeSend: function(request) {
                    request.setRequestHeader("X-Pact-Mock-Service", true);
                },
                async: false
            }); 
        };

        PactBuilder.prototype.setup = function() {
            var self = this,
                interactions = self.pact.interactions;

            for (var i = 0; i < this.pact.interactions.length; i++) {
                $.ajax({
                    url: _host+":"+_port+"/interactions",
                    type: "POST",
                    beforeSend: function(request) {
                        request.setRequestHeader("X-Pact-Mock-Service", true);
                    },
                    contentType: "application/json",
                    data: JSON.stringify(this.pact.interactions[i]),
                    dataType: "json",
                    async: false
                });
            }
            return _port;
        };

        PactBuilder.prototype.verify = function(statePort) { 
            var response;
            $.ajax({
                url: _host+":"+_port+"/interactions/verification",
                type: "GET",
                beforeSend: function(request) {
                    request.setRequestHeader("X-Pact-Mock-Service", true);
                },
                async: false
            }).done(function(data) {
                response = data;
            }); 
            return response;
        };

        PactBuilder.prototype.write = function() {
            var self = this
 
            $.ajax({
                    url: _host+":"+_port+"/pact",
                    type: "POST",
                    beforeSend: function(request) {
                        request.setRequestHeader("X-Pact-Mock-Service", true);
                    },
                    contentType: "application/json",
                    data: JSON.stringify(this.pact),
                    dataType: "json",
                    async: false
                });
        };

        PactBuilder.prototype.runAndWait = function(f) {
            var latch = false;
            runs(function() {
                f();
                latch = true;
            });
            waitsFor(function() {
                return latch;
            });
        };

        PactBuilder.prototype.runInteractions = function(test) {
            var self = this;
            var port;

            //Cleanup the server 
            self.runAndWait(function() {
                self.clean();
            });

            //Post the interactions
            self.runAndWait(function() {
                port = self.setup();
            });
            
            var latch = false;
            var completed = function() {
                latch = true;
            };

            //The real interaction
            runs(function() {
                test(port, completed);
            });

            waitsFor(function() {
                return latch;
            });

            //Verify
            self.runAndWait(function() {
                self.verify(port);
            });

            //Write pact file
            self.runAndWait(function() {
                self.write();
            });
        };
        return PactBuilder;
    });