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
            }}
          />
        )}
        autoHide
        autoHideTimeout={1500}
        autoHideDuration={200}
      >
        {this.props.children}
      </Scrollbars>
    );
  }
}
export default CustomScrollbars;
