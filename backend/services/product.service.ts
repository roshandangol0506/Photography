import Product from "../models/products.model";

class productService {
  async getProduct() {
    try {
      const products = await Product.find();
      return products;
    } catch (error) {
      throw error;
    }
  }
}
export default productService;
