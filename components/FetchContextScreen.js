import React from "react";

export default class FetchContextScreen extends React.Component {
  state = { context: undefined };

  componentDidMount() {
    fetch(this.props.url)
      .then(x => x.json())
      .then(context => this.setState({ context }));
  }

  render() {
    const { context } = this.state;
    const { component: Component } = this.props;
    if (context === undefined) {
      return null;
    } else {
      return <Component screenProps={{ context }}/>;
    }
  }
}