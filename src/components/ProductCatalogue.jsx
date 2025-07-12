import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Ruler, Weight, X } from 'lucide-react';

const Catalogue = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    {
      id: 'P001',
      name: 'Standard Euro Pallet',
      type: 'Euro Pallet',
      dimensions: { length: 1200, width: 800, height: 144 },
      material: 'Pine Wood',
      loadCapacity: 1500,
      image: '/images/pallet-1.jpg',
      features: [
        'EPAL certified for international shipping',
        'Heat treated according to ISPM 15 standards',
        'Standardized dimensions for optimal stacking',
        'Reusable and recyclable construction',
        'Compatible with automated handling systems',
        'Four-way forklift entry design'
      ],
      specifications: {
        deckBoards: 7,
        stringers: 3,
        treatment: 'Heat Treatment (HT)',
        certification: 'EPAL Certified'
      }
    },
    {
      id: 'P002',
      name: 'Heavy Duty Industrial Pallet',
      type: 'Heavy Duty',
      dimensions: { length: 1200, width: 1000, height: 150 },
      material: 'Oak Wood',
      loadCapacity: 3000,
      image: '/images/pallet-2.jpg',
      features: [
        'Extra reinforced construction for heavy loads',
        'Weather resistant oak wood construction',
        'Extended lifespan with proper maintenance',
        'Industrial grade fasteners and hardware',
        'Suitable for outdoor storage applications',
        'Enhanced corner protection design'
      ],
      specifications: {
        deckBoards: 9,
        stringers: 4,
        treatment: 'Pressure Treated',
        certification: 'Industrial Grade'
      }
    },
    {
      id: 'P003',
      name: 'Lightweight Display Pallet',
      type: 'Display Pallet',
      dimensions: { length: 800, width: 600, height: 120 },
      material: 'Birch Wood',
      loadCapacity: 800,
      image: '/images/pallet-3.jpg',
      features: [
        'Smooth sanded finish for retail display',
        'Lightweight design for easy handling',
        'Attractive birch wood appearance',
        'Perfect for point-of-sale displays',
        'Easy to customize with branding',
        'Compact size for space efficiency'
      ],
      specifications: {
        deckBoards: 5,
        stringers: 2,
        treatment: 'Sanded Finish',
        certification: 'Display Grade'
      }
    },
    {
      id: 'P004',
      name: 'Eco-Friendly Recycled Pallet',
      type: 'Eco-Friendly',
      dimensions: { length: 1200, width: 800, height: 140 },
      material: 'Recycled Wood',
      loadCapacity: 1200,
      image: '/images/pallet-4.jpg',
      features: [
        '100% recycled wood materials',
        'Environmentally sustainable choice',
        'Cost-effective solution for standard loads',
        'Contributes to circular economy practices',
        'Reduced carbon footprint manufacturing',
        'Suitable for one-way shipping applications'
      ],
      specifications: {
        deckBoards: 6,
        stringers: 3,
        treatment: 'Recycled Processing',
        certification: 'Eco-Certified'
      }
    },
    {
      id: 'P005',
      name: 'Custom Size Pallet',
      type: 'Custom Design',
      dimensions: { length: 1000, width: 1000, height: 160 },
      material: 'Pine Wood',
      loadCapacity: 2000,
      image: '/images/pallet-5.jpg',
      features: [
        'Tailored dimensions to your specifications',
        'Made-to-order manufacturing process',
        'Quality assured construction standards',
        'Flexible design options available',
        'Professional engineering consultation',
        'Optimized for specific load requirements'
      ],
      specifications: {
        deckBoards: 8,
        stringers: 3,
        treatment: 'Custom Treatment',
        certification: 'Custom Specification'
      }
    },
    {
      id: 'P006',
      name: 'Export Grade Pallet',
      type: 'Export Grade',
      dimensions: { length: 1200, width: 800, height: 150 },
      material: 'Pine Wood',
      loadCapacity: 1800,
      image: '/images/pallet-6.webp',
      features: [
        'ISPM 15 certified for international shipping',
        'Heat treated to eliminate pests and pathogens',
        'Meets international export regulations',
        'Stamped with official certification marks',
        'Suitable for global supply chain operations',
        'Compliant with customs requirements worldwide'
      ],
      specifications: {
        deckBoards: 7,
        stringers: 3,
        treatment: 'ISPM 15 Heat Treatment',
        certification: 'Export Certified'
      }
    }
  ];

  const openProductDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-vh-100 bg-dark text-light simulator-page" style={{ paddingTop: '150px', paddingBottom: '3rem' }}>
      <div className="container-xxl px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-5"
        >
          <h1 className="display-4 fw-bold mb-3">
            <span className="text-warning">Product</span> Catalogue
          </h1>
          <p className="fs-5 text-light mx-auto" style={{ maxWidth: '800px' }}>
            Browse our comprehensive range of high-quality pallets for every need
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="row g-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="col-md-6 col-lg-4"
                onClick={() => openProductDetails(product)}
              >
                <div className="card h-100 bg-secondary border-secondary product-card">
                  <div className="position-relative" style={{ height: '250px' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="card-img-top h-100 w-100 object-fit-cover"
                    />
                    <div className="position-absolute top-0 end-0 m-2 p-2 bg-dark bg-opacity-50 rounded-circle">
                      <Package className="text-warning" size={16} />
                    </div>
                    <div className="position-absolute bottom-0 start-0 m-2 px-3 py-1 bg-dark bg-opacity-75 rounded">
                      <span className="text-warning fw-semibold small">{product.type}</span>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h3 className="h5 card-title fw-bold mb-3">{product.name}</h3>
                    
                    <div className="mb-4 small text-light">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Ruler size={14} className="text-warning" />
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} mm
                      </div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Weight size={14} className="text-warning" />
                        {product.loadCapacity} kg capacity
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Package size={14} className="text-warning" />
                        {product.material}
                      </div>
                    </div>
                    
                    <div className="text-center mt-auto py-2 bg-dark rounded">
                      <span className="text-warning small fw-medium">
                        Click to view features
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Product Details Modal */}
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
            onClick={closeProductDetails}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="modal-dialog modal-dialog-centered modal-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content bg-secondary border-secondary text-light">
                <div className="modal-header">
                  <div>
                    <h2 className="modal-title h5">{selectedProduct.name}</h2>
                    <p className="text-warning fw-medium mb-0">{selectedProduct.type}</p>
                  </div>
                  <button
                    onClick={closeProductDetails}
                    className="btn-close btn-close-white"
                  />
                </div>

                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="img-fluid rounded"
                        style={{ height: '320px', objectFit: 'cover', width: '100%' }}
                      />
                      
                      <div className="mt-4 bg-dark rounded p-3">
                        <h3 className="h6 text-warning mb-3">Specifications</h3>
                        <div className="row g-2 small">
                          <div className="col-6">
                            <span className="text-light">Dimensions:</span>
                            <div className="fw-bold text-white">{selectedProduct.dimensions.length}×{selectedProduct.dimensions.width}×{selectedProduct.dimensions.height} mm</div>
                          </div>
                          <div className="col-6">
                            <span className="text-light">Load Capacity:</span>
                            <div className="fw-bold text-white">{selectedProduct.loadCapacity} kg</div>
                          </div>
                          <div className="col-6">
                            <span className="text-light">Material:</span>
                            <div className="fw-bold text-white">{selectedProduct.material}</div>
                          </div>
                          <div className="col-6">
                            <span className="text-light">Deck Boards:</span>
                            <div className="fw-bold text-white">{selectedProduct.specifications.deckBoards}</div>
                          </div>
                          <div className="col-6">
                            <span className="text-light">Stringers:</span>
                            <div className="fw-bold text-white">{selectedProduct.specifications.stringers}</div>
                          </div>
                          <div className="col-6">
                            <span className="text-light">Treatment:</span>
                            <div className="fw-bold text-white">{selectedProduct.specifications.treatment}</div>
                          </div>
                          <div className="col-12">
                            <span className="text-light">Certification:</span>
                            <div className="fw-bold text-white">{selectedProduct.specifications.certification}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h3 className="h6 text-warning mb-3">Key Features</h3>
                      {selectedProduct.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="d-flex align-items-start gap-3 p-3 bg-dark rounded mb-2"
                        >
                          <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'var(--bs-warning)',
                            borderRadius: '50%',
                            marginTop: '7px',
                            flexShrink: 0
                          }} />
                          <span className="text-light small">{feature}</span>
                        </motion.div>
                      ))}
                      
                      <div className="mt-4" style={{
                        background: 'linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)',
                        color: '#222',
                        borderRadius: '1rem',
                        boxShadow: '0 4px 24px 0 rgba(255, 204, 51, 0.15)',
                        padding: '1.5rem',
                        fontWeight: 500
                      }}>
                        <h4 className="h6 mb-2" style={{ color: '#fff', fontWeight: 700, letterSpacing: '0.5px' }}>Applications</h4>
                        <p className="mb-0" style={{ color: '#fff', fontWeight: 400 }}>
                          This pallet type is ideal for {selectedProduct.type.toLowerCase()} applications, 
                          offering reliable performance with a load capacity of {selectedProduct.loadCapacity}kg. 
                          Perfect for various industrial and commercial use cases.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Catalogue;