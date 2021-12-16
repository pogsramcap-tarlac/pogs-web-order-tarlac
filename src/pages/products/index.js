import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import "./style.css";
import ProductItem from "./components/item";
import axios from "axios";
import useCart from "../../context/cart/hooks/useCart";
import { useStateValue } from "../../context";
import { ADD_ITEM } from "../../context/cart/actions";
import { debounce } from "@material-ui/core";
import { db } from "../../config/firebaseConfig";
import { fireUrl } from "utils/url";

const Products = ({ match, location }) => {
  const [title, setTitle] = useState("All Products");
  const [products, setProducts] = useState([]);
  const [storeClosed, setStoreClosed] = React.useState(false);
  const [search, setSearch] = useState("");
  const [{ auth }] = useStateValue();
  const [cart, setCart, isLoading] = useCart();
  const resourceAPI = fireUrl("product");

  const addCartAPI =
    "https://us-central1-dev-pogsph-v100.cloudfunctions.net/merchant/addCart";

  const fetchList = () => {
    const query = {
      sortBy: "popularity",
      descending: false,
    };

    axios
      .get(resourceAPI, { params: { ...query, merchant: match.params.code } })
      .then((res) => {
        setProducts(res.data.data);

        if (res.data.data.length > 0) {
          setStoreClosed(res.data.data[0].merchant.storeClosed);
          setTitle(res.data.data[0].merchant.storeName);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return axios;
  };

  useEffect(() => {
    fetchList();
  }, []);
  return (
    <section className="features-boxed">
      <Container className="menus-space">
        <div className="intro">
          <h2 className="text-center">{title}</h2>
          <div className="search">
            <div className="search-input fa fa fa-search">
              <input
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search Products"
                className="product-serach"
              />
              <i className="search icon"></i>
            </div>
          </div>
          {/* <p className="text-center">{desc}</p> */}
        </div>
        <Row>
          {storeClosed ? (
            <h1 class="text-center">Store is currently close</h1>
          ) : (
            products
              .filter((product) =>
                product.productName.toLowerCase().includes(search)
              )
              .map((product, key) => (
                <Col sm="2" md="2" className="product-box" key={key}>
                  <ProductItem productDetails={product} />
                </Col>
              ))
          )}
        </Row>
      </Container>
    </section>
  );
};

export default Products;
