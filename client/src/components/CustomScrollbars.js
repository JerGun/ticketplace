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
              backgroundColor: "#4ED0F5",
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
