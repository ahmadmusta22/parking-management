import React, { useEffect, useState } from "react";
import HeaderOne from "../components/HeaderOne";
import FooterAreaOne from "../components/FooterAreaOne";
import Preloader from "../helper/Preloader";
import ContactAreaOnly from "../components/ContactAreaOnly";

const ContactPage = () => {
  let [active, setActive] = useState(true);

  useEffect(() => {
    setTimeout(function () {
      setActive(false);
    }, 2000);
  }, []);

  return (
    <>
      {/* Preloader */}
      {active === true && <Preloader />}

      {/* Header one */}
      <HeaderOne />


      {/* Contact Area */}
      <ContactAreaOnly />

      {/* Footer Area One */}
      <FooterAreaOne />
    </>
  );
};

export default ContactPage;




