"use strict";

var React = require("react");

var util = {

    // findPos() by quirksmode.org
    // Finds the absolute position of an element on a page
    findPos: function findPos(obj) {
        var curleft = 0,
            curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return [curleft, curtop];
    },

    // getPageScroll() by quirksmode.org
    // Finds the scroll position of a page
    getPageScroll: function getPageScroll() {
        var xScroll, yScroll;
        if (self.pageYOffset) {
            yScroll = self.pageYOffset;
            xScroll = self.pageXOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {
            yScroll = document.documentElement.scrollTop;
            xScroll = document.documentElement.scrollLeft;
        } else if (document.body) {
            // all other Explorers
            yScroll = document.body.scrollTop;
            xScroll = document.body.scrollLeft;
        }
        return [xScroll, yScroll];
    },

    // Finds the position of an element relative to the viewport.
    findPosRelativeToViewport: function findPosRelativeToViewport(obj) {
        var objPos = this.findPos(obj);
        var scroll = this.getPageScroll();
        return [objPos[0] - scroll[0], objPos[1] - scroll[1]];
    }

};

var SimplePageScrollMixin = {
    componentDidMount: function componentDidMount() {
        window.addEventListener("scroll", this.onScroll, false);
    },
    componentWillUnmount: function componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll, false);
    }
};
var SimpleResizeMixin = {
    componentDidMount: function componentDidMount() {
        window.addEventListener("resize", this.handleResize);
    },

    componentWillUnmount: function componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }
};

var StickyDiv = React.createClass({
    mixins: [SimplePageScrollMixin, SimpleResizeMixin],
    displayName: "StickyDiv",
    propTypes: {
        offsetTop: React.PropTypes.number,
        zIndex: React.PropTypes.number,
        className: React.PropTypes.string
    },
    getInitialState: function getInitialState() {
        return {
            fix: false,
            width: null
        };
    },
    getDefaultProps: function getDefaultProps() {
        return {
            offsetTop: 0,
            className: "",
            zIndex: 9999
        };
    },
    handleResize: function handleResize() {
        this.checkWidth();
        this.checkPositions();
    },
    onScroll: function onScroll() {
        this.checkWidth();
        this.checkPositions();
    },
    checkPositions: function checkPositions() {
        var pos = util.findPosRelativeToViewport(this.getDOMNode());
        if (pos[1] <= this.props.offsetTop) {
            this.setState({ fix: true });
        } else {
            this.setState({ fix: false });
        }
    },
    checkWidth: function checkWidth() {
        var width = null;
        if (this.refs.duplicate) {
            width = this.refs.duplicate.getDOMNode().getBoundingClientRect().width;
        } else {
            width = this.refs.original.getDOMNode().getBoundingClientRect().width;
        }
        if (this.state.width !== width) {
            this.setState({
                width: width
            });
        }
    },
    componentDidMount: function componentDidMount() {
        this.checkWidth();
    },
    render: function render() {
        var divStyle;

        if (this.state.fix) {
            divStyle = {
                display: "block",
                position: "fixed",
                width: this.state.width ? this.state.width + "px" : null,
                top: this.props.offsetTop
            };
            return React.createElement(
                "div",
                { style: { zIndex: this.props.zIndex, position: "relative", width: "100%" } },
                React.createElement(
                    "div",
                    { ref: "duplicate", key: "duplicate", style: { visibility: "hidden" } },
                    this.props.children
                ),
                React.createElement(
                    "div",
                    { ref: "original", key: "original", className: this.props.className, style: divStyle },
                    this.props.children
                )
            );
        } else {
            divStyle = {
                display: "block",
                position: "relative"
            };
            return React.createElement(
                "div",
                { style: { zIndex: this.props.zIndex, position: "relative", width: "100%" } },
                React.createElement(
                    "div",
                    { ref: "original", key: "original", style: divStyle },
                    this.props.children
                )
            );
        }
    }
});

module.exports = StickyDiv;