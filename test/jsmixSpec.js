
var sampleData = {
	"employees": [
		{
			"firstName": "John",
			"lastName": "Doe",
			"salary": 100000,
			"age": 33	
		},
		{
			"firstName": "Romeo",
			"lastName": "Alfa",
			"salary": 150000,
			"age": 34
		}
	],
	"department": {
		"name": "Most important ever",
		"location": "Center of the World"
	}
}


describe("JSMix", function() {
  it("mix single data object with prototype", function() {
	  var result = JSMix(sampleData).withObject(Department.prototype, "department").build();
    expect(result.department.getTime()).toContain("Time at Center of the World is");
  });
  it("can also handle a JSON string", function() {
	  var result = JSMix('{"department":{"location":"here"}}').withObject(Department.prototype, "department").build();
    expect(result.department.getTime()).toContain("Time at here is");
  });
});
