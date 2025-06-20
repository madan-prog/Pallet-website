import RippleButton from './RippleButton';

const ProductCatalogue = () => {
  const products = [
    { id: 1, name: 'Standard Wood Pallet', size: '100x100cm', price: '$50' },
    { id: 2, name: 'Heavy Duty Pallet', size: '120x120cm', price: '$80' },
  ];

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold">Product Catalogue</h2>
      <div className="row g-4">
        {products.map((p) => (
          <div key={p.id} className="col-md-6">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">Size: {p.size}</p>
                <p className="card-text">Price: {p.price}</p>
                <RippleButton className="btn btn-outline-primary mt-2">
                  Request Quote
                </RippleButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalogue;
