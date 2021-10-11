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
      await Container.#saveProducts(this.path, this.products);
    }

    const products = await Container.#getProducts(this.path);
    Container.#hasLastId(products);
    this.products = products;
  }

  async save(newProduct) {
    if (!newProduct) {
      throw new Error('You must send a product object');
    }
    
    IdGenerator.next();
    newProduct.id = IdGenerator.current();

    try {
      await Container.#saveProducts(this.path, [...this.products, newProduct]);
      this.products = [...this.products, newProduct];
      return newProduct.id;
    } catch (error) {
      console.log(error);
    }
  }

  getById(productId) {
    return this.products.find(product => product.id === productId) || null;
  }

  getAll() {
    return this.products;
  }

  async deleteById(id) {
    const productsFiltered = this.products.filter(product => product.id !== id);
    try {
      await Container.#saveProducts(this.path, productsFiltered);
      this.products = productsFiltered;      
    } catch (error) {
      console.log(error);
    }
  }

  async deleteAll() {
    try {
      await Container.#saveProducts(this.path, []);
      this.products = []
    } catch (error) {
      console.log(error);
    }
  }

  static async #getProducts(path) {
    const response = await fs.readFileSync(path, 'utf-8');
    return JSON.parse(response);
  }

  static async #saveProducts(path, products) {
    await fs.writeFileSync(path, JSON.stringify(products));
  }

  static #hasLastId(products) {
    if (products.length > 0) {
      const product = products[products.length - 1];
      IdGenerator.set(product.id);
    }
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
  const productId = await container.save(productData);
  console.log(productId,'productId created');
  const product = container.getById(productId);
  console.log(product, 'get product by id');
  const products = container.getAll();
  console.log(products, 'get all products');
  await container.deleteById(productId);
  console.log(container.getById(productId), 'product deleted');
  await container.deleteAll();
  console.log(container.getAll(), 'get all after deleted all');
})();
