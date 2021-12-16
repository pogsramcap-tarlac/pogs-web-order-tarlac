import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import "./style.css";
import MerchantItem from "./components/list";
import axios from "axios";
import { fireUrl } from "../../utils/url";
import { useStateValue } from "context";

export const Merchants = () => {
  const [merchantData, setMerchantData] = React.useState([]);
  const [search, setSearch] = useState("");
  const merchantAPI = fireUrl("merchant?status=approved");

  const fetchMerchantData = () => {
    const query = {
      sortBy: "popularity",
      descending: true,
    };

    axios
      .get(merchantAPI, { params: query })
      .then((res) => {
        setMerchantData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchMerchantData();
  }, []);

  return (
    <section className="features-boxed">
      <Container className="menus-space">
        <div className="intro">
          <h2 className="text-center">STORE</h2>
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
        </div>
        <Row>
          {/* {products.map(x => x.productName)}  */}
          {merchantData
            .filter((merchant) =>
              merchant.storeName.toLowerCase().includes(search)
            )
            .map((merchant, key) => (
              <Col sm="2" md="2" className="merchant-box" key={key}>
                <MerchantItem merchantDetails={merchant} />
              </Col>
            ))}
        </Row>
      </Container>
    </section>
  );
};

export default Merchants;
