import React, { Component } from 'react';
import * as styles from './SuggestionBox.module.css';
import Keyword from '../Keyword/Keyword';
import * as actions from '../../containers/store/actions/index';
import { connect } from 'react-redux';

class SuggestionBox extends Component {
    constructor(props) {
        super(props);

        this.suggestionBox = React.createRef();
    }

    state = {
        visible: true,
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.onBoxHide);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onBoxHide);
    }

    onBoxHide = (event) => {
        if (this.suggestionBox && !this.suggestionBox.current.contains(event.target)) {
            this.props.onSearching(false);
        }
    }

    render() {
        const className = this.props.keywords.length === 0 ? 'no-suggestion' : 'suggestion';
        const suggestions = this.props.keywords.length === 0 ? (
            <h2>Not found :C</h2>
        ) : (
                this.props.keywords.map(keyword => (
                    <Keyword directable={this.props.directable} clicked={this.props.clicked} userRole={this.props.userRole} userId={this.props.userId}>{keyword}</Keyword>
                ))
            )
        return (
            <div ref={this.suggestionBox} className={[styles[className], styles[this.props.customStyle]].join(' ')} >
                { suggestions}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        onSearchBoxShowing: state.otherReducer.onSearching
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSearching: (value) => dispatch(actions.onSearching(value))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SuggestionBox);
