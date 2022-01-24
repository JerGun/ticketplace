import { React, Component } from "react";

import { Scrollbars } from "react-custom-scrollbars";

class CustomScrollbars extends Component {
  render() {
    return (
      <Scrollbars
        renderThumbVertical={({ style, ...props }) => (
          <div
            {...props}
            style={{
              ...style,
              backgroundColor: "white",
              borderRadius: "25px",
              zIndex: 0,
            }}
          />
        )}
      >
        {this.props.children}
      </Scrollbars>
    );
  }
}
export default CustomScrollbars;
