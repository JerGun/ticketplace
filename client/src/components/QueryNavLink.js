import React from "react";
import { useLocation, NavLink } from "react-router-dom";

function QueryNavLink({ to, itemId, ...props }) {
  let location = useLocation();
  return (
    <NavLink to={to + location.search} {...props} state={{ itemId: itemId }} />
  );
}

export default QueryNavLink;
