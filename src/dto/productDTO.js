class ProductDTO {
    constructor(product) {
        this.id = product._id;
        this.title = product.title;
        this.description = product.description;
        this.price = product.price;
        this.thumbnail = product.thumbnail || [];
        this.code = product.code;
        this.stock = product.stock;
        this.status = product.status !== undefined ? product.status : true;
        this.category = product.category;
        
        if (product.owner) {
            this.owner = product.owner;
        }
    }
}

export const createProductDTO = (product) => {
    if (!product) return null;
    return new ProductDTO(product);
};

export const createProductDTOArray = (products) => {
    if (!products || !Array.isArray(products)) return [];
    return products.map(product => new ProductDTO(product));
};

export default ProductDTO;