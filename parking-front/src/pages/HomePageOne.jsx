import React, { useEffect, useState } from "react";
import HeaderOne from "../components/HeaderOne";
import HeroOne from "../components/HeroOne";
import CounterOne from "../components/CounterOne";
import AboutOne from "../components/AboutOne";
import FooterAreaOne from "../components/FooterAreaOne";
import ParkingQuickAccess from "../components/ParkingQuickAccess";
import Preloader from "../helper/Preloader";

const HomePageOne = () => {
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

      {/* Hero One */}
      <HeroOne />

      {/* Parking Quick Access */}
      <ParkingQuickAccess />

      {/* Counter One */}
      <CounterOne />

      {/* About One */}
      <AboutOne />


      {/* Footer Area One */}
      <FooterAreaOne />
    </>
  );
};

export default HomePageOne;
