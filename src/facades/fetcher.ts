import fetch from "node-fetch";

const u1 = "https://api.genderize.io?name=";
const u2 = "https://api.nationalize.io?name=";
const u3 = "https://api.agify.io?name=";

const f = async function nameInfo(name: string) {
  const urls = [u1, u2, u3];

  const nameResult = {};
  const promises: Promise<any>[] = [];
  for (let i = 0; i < urls.length; i++) {
    const u = await fetch(`${urls[i]}${name}`).then((r) => r.json());
    promises.push(u);
  }

  const infos = await Promise.all(promises);
  const gender = infos[0].gender;
  const countries :string[] = [];
  infos[1].country.forEach((c: { country_id: string }) => {
    countries.push(c.country_id);
  });
  const age=infos[2].age
  const nameInfo= {gender,countries,age};
  return nameInfo
};
export default f;
