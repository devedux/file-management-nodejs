const fs = require('fs');

const IdGenerator = (function () {
  let id = 0;

  const current = () => id;
  const next = () => id++;
  const set = (newId) => id = newId;

  return {
    set,
    current,
    next,
  };
})();

class Container {

  constructor(filename) {
    this.path = `${filename}.txt`;
    this.products = [];
  }

  async init() {
    const existPath = await fs.existsSync(this.path);

    if (!existPath) {
      await fs.writeFileSync(this.path, JSON.stringify(this.products));
    }

    const products = await Container.#getProducts(this.path);
    Container.#hasLastId(products);
    this.products = products;
  }


}

(async function () {
  const productData = {
    title: 'Escuadra',
    price: 123.45,
    thumbnail: 'https://cdn3.iconfinder.com/data',  
  }

  const container = new Container('products');
  await container.init();

})();
