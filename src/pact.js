define('pact', [], function () {
	function Pact() {
		this.provider = {};
		this.consumer = {};
		this.interactions = [];
		this.metadata = {
			"pact_gem" : {
			"version" : "1.0.9"
			}
		};
	}
	return Pact;
});