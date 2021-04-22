import chai from "chai";
const expect = chai.expect;
import app from "../src/app";
import supertes from "supertest";
const request = supertes(app);
import nock from "nock";

// use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("## Verify the name endpoint ##", function () {
  before(async function () {
    const u1 = "https://api.genderize.io";
    const u2 = "https://api.nationalize.io";
    const u3 = "https://api.agify.io";

    nock(u1).get("/?name=magda").reply(200, { gender: "female" });
    nock(u2)
      .get("/?name=magda")
      .reply(200, { country: [{ country_id: "PL" }, { country_id: "DK" }] });
    nock(u3).get("/?name=magda").reply(200, { age: 33 });
  });

  describe("Verify the nameInfo ", () => {
    it(`It should find info about magda`, async () => {
      const response = await request.get("/api/name/magda");

      expect(response.body.gender).to.equal("female");
      expect(response.body.age).to.equal(33);
      expect(response.body.countries).to.be.an("array").that.includes("PL");
    });
  });
});
