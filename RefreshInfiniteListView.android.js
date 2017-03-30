'use strict';

const React = require('react');
const {
    PropTypes,
} = React;
const ReactNative = require('react-native');
const {
    Image,
    View,
    Text,
    StyleSheet,
    ListView,
    Dimensions,
    ActivityIndicator,
    PanResponder,
    Animated,
} = ReactNative;

/* list status change graph
*
*STATUS_NONE->[STATUS_REFRESH_IDLE, STATUS_INFINITE_IDLE, STATUS_INFINITE_LOADED_ALL]
*STATUS_REFRESH_IDLE->[STATUS_NONE, STATUS_WILL_REFRESH]
*STATUS_WILL_REFRESH->[STATUS_REFRESH_IDLE, STATUS_REFRESHING]
*STATUS_REFRESHING->[STATUS_NONE]
*STATUS_INFINITE_IDLE->[STATUS_NONE, STATUS_WILL_INFINITE]
*STATUS_WILL_INFINITE->[STATUS_INFINITE_IDLE, STATUS_INFINITING]
*STATUS_INFINITING->[STATUS_NONE]
*STATUS_INFINITE_LOADED_ALL->[STATUS_NONE]
*
*/
const
    STATUS_NONE = 0,
    STATUS_REFRESH_IDLE = 1,
    STATUS_WILL_REFRESH = 2,
    STATUS_REFRESHING = 3,
    STATUS_INFINITE_IDLE = 4,
    STATUS_WILL_INFINITE = 5,
    STATUS_INFINITING = 6,
    STATUS_INFINITE_LOADED_ALL = 7;

const DEFAULT_PULL_DISTANCE = 60;
const DEFAULT_HF_HEIGHT = 50;

module.exports = React.createClass({
    propTypes: {
        footerHeight : PropTypes.number,
        pullDistance : PropTypes.number,
        renderEmptyRow : PropTypes.func,
        renderHeaderRefreshIdle : PropTypes.func,
        renderHeaderWillRefresh : PropTypes.func,
        renderHeaderRefreshing : PropTypes.func,
        renderFooterInifiteIdle : PropTypes.func,
        renderFooterWillInifite : PropTypes.func,
        renderFooterInifiting : PropTypes.func,
        renderFooterInifiteLoadedAll : PropTypes.func,
    },
    getDefaultProps () {
        return {
            footerHeight: DEFAULT_HF_HEIGHT,
            pullDistance: DEFAULT_PULL_DISTANCE,
            renderEmptyRow: () => {
                return (
                    <View style={{ height:Dimensions.get('window').height * 2 / 3, justifyContent:'center', alignItems:'center' }}>
                        <Text style={{ fontSize:40, fontWeight:'800', color:'red' }}>
                            have no data
                        </Text>
                    </View>
                );
            },
            renderHeaderRefreshIdle: () => {
                return (
                    <View style={{ height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center' }}>
                        <Text style={styles.text}>
                        pull down refresh...
                    </Text>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={styles.image}
                        />
                    </View>
                );
            },
            renderHeaderWillRefresh: () => {
                return (
                    <View style={{ height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center' }}>
                        <Text style={styles.text}>
                        release to refresh...
                    </Text>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={[styles.image, styles.imageRotate]}
                        />
                    </View>
                );
            },
            renderHeaderRefreshing: () => {
                return (
                    <View style={{ height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center' }}>
                        <Text style={styles.text}>
                        refreshing...
                    </Text>

                        <ActivityIndicator
                            size='small'
                            animating />
                    </View>
                );
            },
            renderFooterInifiteIdle: () => {
                return (
                    <View style={{ height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center' }}>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={[styles.image, styles.imageRotate]}
                        />
                        <Text style={styles.text}>
                        pull up to load more...
                    </Text>
                    </View>
                );
            },
            renderFooterWillInifite: () => {
                return (
                    <View style={{ height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center' }}>
                        <Image
                            source={require('./pull_arrow.png')}
                            resizeMode={Image.resizeMode.stretch}
                            style={styles.image}
                        />
                        <Text style={styles.text}>
                        release to load more...
                    </Text>
                    </View>
                );
            },
            renderFooterInifiting: () => {
                return (
                    <View style={{ height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center' }}>
                        <ActivityIndicator
                            size='small'
                            animating />
                        <Text style={styles.text}>
                        loading...
                    </Text>
                    </View>
                );
            },
            renderFooterInifiteLoadedAll: () => {
                return (
                    <View style={{ height:DEFAULT_HF_HEIGHT, justifyContent:'center', alignItems:'center' }}>
                        <Text style={styles.text}>
                        have loaded all data
                    </Text>
                    </View>
                );
            },
            loadedAllData: () => {
                return false;
            },
            onRefresh: () => {
                console.log('onRefresh');
            },
            onInfinite: () => {
                console.log('onInfinite');
            },
        };
    },
    getInitialState () {
        this.scrollFromTop = true;
        this.contentHeight = 0;
        this.height = 0;
        this.scrollY = 0;
        this.isCanScroll = false;
        this.maxScrollY = 0;
        return {
            status: STATUS_NONE,
            translateY: new Animated.Value(0),
            isScrollEnable: false,
        };
    },
    renderRow (obj, sectionID, rowID) {
        if (this.dataSource) {
            return this.props.renderEmptyRow(obj);
        } else {
            return this.props.renderRow(obj);
        }
    },
    renderHeader () {
        const status = this.state.status;
        if (status === STATUS_REFRESH_IDLE) {
            return this.props.renderHeaderRefreshIdle();
        }
        if (status === STATUS_WILL_REFRESH) {
            return this.props.renderHeaderWillRefresh();
        }
        if (status === STATUS_REFRESHING) {
            return this.props.renderHeaderRefreshing();
        }
        return null;
    },
    renderFooter () {
        const status = this.state.status;
        this.footerIsRender = true;
        if (status === STATUS_INFINITE_IDLE) {
            return this.props.renderFooterInifiteIdle();
        }
        if (status === STATUS_WILL_INFINITE) {
            return this.props.renderFooterWillInifite();
        }
        if (status === STATUS_INFINITING) {
            return this.props.renderFooterInifiting();
        }
        if (status === STATUS_INFINITE_LOADED_ALL) {
            return this.props.renderFooterInifiteLoadedAll();
        }
        this.footerIsRender = false;
        return null;
    },
    renderFooterInner () {
        if (!this.isCanScroll) {
            return this.renderFooter();
        }
        return null;
    },
    renderFooterOutter () {
        if (this.isCanScroll) {
            return this.renderFooter();
        }
        return null;
    },
    hideHeader () {
        this.setState({ status:STATUS_NONE });
    },
    hideFooter () {
        this.setState({ status:STATUS_NONE });
    },
    componentWillMount () {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => !this.state.isScrollEnable,
            onMoveShouldSetPanResponder: () => !this.state.isScrollEnable,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderRelease: this.handlePanResponderEnd,
            onPanResponderTerminate: this.handlePanResponderEnd,
        });
    },
    onLayout (e) {
        this.height = e.nativeEvent.layout.height;
        this.isCanScroll = this.contentHeight > this.height;
        this.maxScrollY = Math.floor(this.contentHeight - this.height);
    },
    onContentSizeChange (contentWidth, contentHeight) {
        this.contentHeight = contentHeight;
        this.isCanScroll = this.contentHeight > this.height;
        this.maxScrollY = Math.floor(this.contentHeight - this.height);
    },
    handlePanResponderMove (e, gestureState) {
        const offset = gestureState.dy;
        const { status } = this.state;
        let lastStatus = status;
        if (this.scrollY === 0) {
            if (offset > 0 && status === STATUS_NONE) {
                lastStatus = STATUS_REFRESH_IDLE;
                this.setState({ status:STATUS_REFRESH_IDLE });
            } else if (offset < 0) {
                if (this.isCanScroll) {
                    this.scrollFromTop = true;
                } else if (status === STATUS_NONE) {
                    if (!this.props.loadedAllData()) {
                        lastStatus = STATUS_INFINITE_IDLE;
                        this.setState({ status:STATUS_INFINITE_IDLE });
                    } else {
                        lastStatus = STATUS_INFINITE_LOADED_ALL;
                        this.setState({ status:STATUS_INFINITE_LOADED_ALL });
                    }
                }
            }
        } else if (this.isCanScroll && this.scrollY >= this.maxScrollY) {
            if (offset < 0 && status === STATUS_NONE) {
                if (!this.props.loadedAllData()) {
                    lastStatus = STATUS_INFINITE_IDLE;
                    this.setState({ status:STATUS_INFINITE_IDLE });
                } else {
                    lastStatus = STATUS_INFINITE_LOADED_ALL;
                    this.setState({ status:STATUS_INFINITE_LOADED_ALL });
                }
            } else if (offset > 0) {
                this.scrollFromTop = false;
            }
        }
        if (this.isCanScroll && lastStatus === STATUS_NONE) {
            if (this.scrollFromTop && offset < 0) {
                this.refs.scrollView.scrollTo({ y: -offset, animated: true });
            } else if (!this.scrollFromTop && offset > 0) {
                this.refs.scrollView.scrollTo({ y: this.maxScrollY - offset, animated: true });
            }
        }

        if (status === STATUS_REFRESH_IDLE || status === STATUS_WILL_REFRESH) {
            this.state.translateY.setValue(offset / 2);
            if (offset < this.props.pullDistance) {
                this.setState({ status: STATUS_REFRESH_IDLE });
            } else if (offset > this.props.pullDistance) {
                this.setState({ status: STATUS_WILL_REFRESH });
            }
        } else if (status === STATUS_INFINITE_IDLE || status === STATUS_WILL_INFINITE) {
            this.state.translateY.setValue(offset / 2);
            if (offset > -this.props.pullDistance - this.props.footerHeight) {
                this.setState({ status: STATUS_INFINITE_IDLE });
            } else if (offset < -this.props.pullDistance - this.props.footerHeight) {
                this.setState({ status: STATUS_WILL_INFINITE });
            }
        }
    },
    handlePanResponderEnd (e, gestureState) {
        const status = this.state.status;
        this.state.translateY.setValue(0);
        if (status === STATUS_REFRESH_IDLE) {
            this.setState({ status:STATUS_NONE });
        } else if (status === STATUS_WILL_REFRESH) {
            this.setState({ status:STATUS_REFRESHING });
            this.props.onRefresh();
        } else if (status === STATUS_INFINITE_IDLE) {
            this.setState({ status:STATUS_NONE });
        } else if (status === STATUS_WILL_INFINITE) {
            this.setState({ status:STATUS_INFINITING });
            this.props.onInfinite();
        } else if (status === STATUS_INFINITE_LOADED_ALL) {
            this.setState({ status:STATUS_NONE });
        }
        if (this.scrollY > 0 && this.scrollY < (this.footerIsRender ? this.maxScrollY - this.props.footerHeight : this.maxScrollY)) {
            this.setState({ isScrollEnable: true });
        }
    },
    isScrolledToTop () {
        if ((this.scrollY === 0 || this.scrollY === this.maxScrollY) && this.state.isScrollEnable) {
            this.setState({ isScrollEnable: false });
        }
    },
    handleScroll (event) {
        this.scrollY = Math.floor(event.nativeEvent.contentOffset.y);
    },
    render () {
        const { translateY, isScrollEnable } = this.state;
        this.dataSource = null;
        if (!this.props.dataSource.getRowCount()) {
            const DataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
            this.dataSource = DataSource.cloneWithRows(['']);
        }
        return (
            <Animated.View style={{ flex:1, transform:[{ translateY }] }} {...this._panResponder.panHandlers}>
                {this.renderHeader()}
                <ListView
                    {...this.props}
                    ref='scrollView'
                    dataSource={this.dataSource ? this.dataSource : this.props.dataSource}
                    renderRow={this.renderRow}
                    renderFooter={this.renderFooterInner}
                    scrollEnabled={isScrollEnable}
                    onLayout={this.onLayout}
                    onContentSizeChange={this.onContentSizeChange}
                    onScroll={this.handleScroll}
                    onTouchEnd={() => { this.isScrolledToTop(); }}
                    onScrollEndDrag={() => { this.isScrolledToTop(); }}
                    onMomentumScrollEnd={() => { this.isScrolledToTop(); }}
                    onResponderRelease={() => { this.isScrolledToTop(); }}
                    />
                {this.renderFooterOutter()}
            </Animated.View>
        );
    },
});

const styles = StyleSheet.create({
    text: {
        fontSize:16,
    },
    image: {
        width:40,
        height:32,
    },
    imageRotate: {
        transform:[{ rotateX: '180deg' }],
    },
});
