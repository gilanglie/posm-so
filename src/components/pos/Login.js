import React from 'react';
import {Link} from 'react-router-dom';

const ProductGridItem = ({product}) => {
  const {id,image, name} = product;
  return (

    <div className="col-xl-3 col-md-4 col-sm-6 col-12">
    <Link className="jr-list-link" to={{    pathname:"/app/pos/products", state: { category: name, categ_id: id }   }} >
      <div className="card product-item">
        <div className="card-header border-0 p-0">
          <div className="card-image">
            <div className="grid-thumb-equal">
              <span className="grid-thumb-cover jr-link">
                {!image ? 
                <img alt='thumbnail' src='https://via.placeholder.com/600x400'/> 
                :
                <img alt={name} src={ `data:image/png;base64,${image}` }/>                
                }
              </span>
            </div>
          </div>
        </div>
        <div className="card-body ">
          <div className="product-details text-center">
            <h3 className="card-title fw-regular">
                {name}
            </h3>
          </div>
        </div>
      </div>
      </Link>
    </div>
  )
};

export default ProductGridItem;

