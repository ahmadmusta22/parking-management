import React, { useEffect, useState } from "react";
import HeaderOne from "../components/HeaderOne";
import AboutTwo from "../components/AboutTwo";
import TeamAreaTwo from "../components/TeamAreaTwo";
import FooterAreaOne from "../components/FooterAreaOne";
import Preloader from "../helper/Preloader";

const AboutPage = () => {
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

      {/* About Two */}
      <AboutTwo />

      {/* Team Area Two */}
      <TeamAreaTwo />

      {/* Footer Area One */}
      <FooterAreaOne />
    </>
  );
};

export default AboutPage;


